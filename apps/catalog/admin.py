from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from config.admin_mixins import LocalizedImportExportModelAdmin as ImportExportModelAdmin
from import_export import resources, fields
from unfold.contrib.filters.admin import RelatedCheckboxFilter, ChoicesCheckboxFilter, BooleanRadioFilter
from .models import Category, Brand, Product, Variant, ProductImage, Review, SiteSetting
from django.utils.html import format_html
from django import forms
from django.forms.models import BaseInlineFormSet
from django.core.exceptions import ValidationError
from apps.inventory.models import Inventory

class ProductVariantResource(resources.ModelResource):
    product_slug = fields.Field(column_name='شناسه محصول (Slug)')
    product_name = fields.Field(column_name='نام کالا')
    category_name = fields.Field(column_name='دسته‌بندی')
    brand_name = fields.Field(column_name='برند')
    
    sku = fields.Field(attribute='sku', column_name='کد متغیر (SKU)')
    variant_name = fields.Field(attribute='name', column_name='ویژگی (مثل رنگ/سایز)')
    price = fields.Field(attribute='price', column_name='قیمت متغیر')
    stock = fields.Field(column_name='موجودی')

    class Meta:
        model = Variant
        import_id_fields = ('sku',)
        fields = ('product_slug', 'product_name', 'category_name', 'brand_name', 'sku', 'variant_name', 'price', 'stock')
        skip_unchanged = True

    def before_import(self, dataset, **kwargs):
        super().before_import(dataset, **kwargs)
        self._last_product = None
        if dataset.headers:
            dataset.headers = [
                str(h).lstrip('\ufeff').strip() if h else h
                for h in dataset.headers
            ]

    def _extract_val(self, row, *keys):
        # 1. Direct lookup
        for k in keys:
            if k in row and row[k] is not None and str(row[k]).strip() != '':
                return str(row[k]).strip()
        # 2. Case-insensitive / stripped BOM lookup
        clean_row = {str(k).lstrip('\ufeff').strip().lower(): v for k, v in row.items()}
        for k in keys:
            clean_k = k.lower()
            if clean_k in clean_row and clean_row[clean_k] is not None and str(clean_row[clean_k]).strip() != '':
                return str(clean_row[clean_k]).strip()
        return ''

    def before_save_instance(self, instance, row, **kwargs):
        from django.utils.text import slugify
        slug = self._extract_val(row, 'شناسه محصول (Slug)', 'product_slug', 'slug')
        name = self._extract_val(row, 'نام کالا', 'product_name', 'name')
        cat_name = self._extract_val(row, 'دسته‌بندی', 'category_name', 'category')
        brand_name = self._extract_val(row, 'برند', 'brand_name', 'brand')
        
        target_product = None
        if slug:
            category = None
            if cat_name:
                cat_slug = slugify(cat_name, allow_unicode=True) or 'cat-general'
                category, _ = Category.objects.get_or_create(name=cat_name, defaults={'slug': cat_slug})
            else:
                category, _ = Category.objects.get_or_create(name='دسته‌بندی عمومی', defaults={'slug': 'cat-general'})
                
            brand = None
            if brand_name:
                brand_slug = slugify(brand_name, allow_unicode=True) or 'brand-general'
                brand, _ = Brand.objects.get_or_create(name=brand_name, defaults={'slug': brand_slug})
                
            target_product, _ = Product.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name if name else slug,
                    'category': category,
                    'brand': brand,
                    'description': name if name else slug,
                }
            )
            
            # If product existed but missing category/brand/name
            updated = False
            if name and (not target_product.name or target_product.name == slug):
                target_product.name = name
                updated = True
            if category and not target_product.category:
                target_product.category = category
                updated = True
            if brand and not target_product.brand:
                target_product.brand = brand
                updated = True
            if updated:
                target_product.save()
                
            self._last_product = target_product
        elif self._last_product:
            target_product = self._last_product
            
        if target_product:
            instance.product = target_product
        
        # Save stock quantity on instance temporarily
        stock_val = self._extract_val(row, 'موجودی', 'stock', 'quantity')
        instance.__stock = stock_val if stock_val != '' else 0

    def after_save_instance(self, instance, row, **kwargs):
        super().after_save_instance(instance, row, **kwargs)
        dry_run = kwargs.get('dry_run', False)
        if not dry_run and hasattr(instance, '__stock'):
            try:
                stock_qty = int(instance.__stock)
                Inventory.objects.update_or_create(
                    variant=instance,
                    defaults={'quantity': stock_qty}
                )
            except (ValueError, TypeError):
                pass

@admin.register(Category)
class CategoryAdmin(ModelAdmin, ImportExportModelAdmin):
    list_display = ('name', 'slug', 'parent')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Brand)
class BrandAdmin(ModelAdmin, ImportExportModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

class VariantForm(forms.ModelForm):
    stock_quantity = forms.IntegerField(
        label='تعداد موجودی انبار',
        required=False,
        min_value=0,
        help_text='اختیاری'
    )

    class Meta:
        model = Variant
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            try:
                self.fields['stock_quantity'].initial = self.instance.inventory.quantity
            except Inventory.DoesNotExist:
                pass

class VariantInlineFormSet(BaseInlineFormSet):
    def clean(self):
        super().clean()
        if any(self.errors):
            return
        
        has_variant = False
        for form in self.forms:
            if self.can_delete and self._should_delete_form(form):
                continue
            if form.cleaned_data and not form.cleaned_data.get('DELETE', False):
                has_variant = True
                break
                
        if not has_variant:
            raise ValidationError("وارد کردن حداقل یک متغیر (شامل کد کالا و قیمت) برای هر محصول الزامی است.")

class VariantInline(TabularInline):
    model = Variant
    form = VariantForm
    formset = VariantInlineFormSet
    extra = 0
    min_num = 1

class ProductImageInline(TabularInline):
    model = ProductImage
    extra = 1
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />', obj.image.url)
        return ""
    image_preview.short_description = 'پیش‌نمایش'


@admin.register(Product)
class ProductAdmin(ModelAdmin, ImportExportModelAdmin):
    resource_classes = [ProductVariantResource]
    list_display = ('name', 'category', 'brand', 'is_active', 'image_preview', 'created_at')
    list_filter = (
        ('is_active', BooleanRadioFilter),
        ('category', RelatedCheckboxFilter),
        ('brand', RelatedCheckboxFilter),
    )
    list_filter_submit = True
    show_facets = admin.ShowFacets.ALWAYS
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, VariantInline]
    
    fieldsets = (
        ('اطلاعات اصلی', {
            'fields': ('name', 'slug', 'description', 'detailed_description', 'category', 'brand')
        }),
        ('تصویر محصول', {
            'fields': ('image',),
            'description': 'لطفاً تصاویر با کیفیت و ترجیحاً با نسبت ابعاد ۴:۳ (مثلاً 800x600) آپلود کنید.'
        }),
        ('وضعیت', {
            'fields': ('is_active',)
        }),
    )
    readonly_fields = ()

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />', obj.image.url)
        return "بدون تصویر"
    image_preview.short_description = 'تصویر'



    def save_formset(self, request, form, formset, change):
        super().save_formset(request, form, formset, change)
        if formset.model == Variant:
            for inline_form in formset.forms:
                if inline_form.cleaned_data and not inline_form.cleaned_data.get('DELETE'):
                    stock_quantity = inline_form.cleaned_data.get('stock_quantity')
                    if stock_quantity is not None:
                        Inventory.objects.update_or_create(
                            variant=inline_form.instance,
                            defaults={'quantity': stock_quantity}
                        )

@admin.register(Variant)
class VariantAdmin(ModelAdmin, ImportExportModelAdmin):
    list_display = ('sku', 'product', 'name', 'price', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('sku', 'product__name')

@admin.register(Review)
class ReviewAdmin(ModelAdmin, ImportExportModelAdmin):
    list_display = ('product', 'user', 'stars_display', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'rating', 'created_at')
    search_fields = ('product__name', 'user__email', 'comment')
    readonly_fields = ('user', 'product', 'stars_display', 'comment')
    exclude = ('rating',)
    actions = ['approve_reviews']

    @admin.display(description='امتیاز')
    def stars_display(self, obj):
        if not obj.rating:
            return "-"
        stars = '★' * obj.rating
        empty_stars = '☆' * (5 - obj.rating)
        return format_html('<span style="color: #fbbf24; font-size: 1.2rem; letter-spacing: 2px;">{}{}</span>', stars, empty_stars)

    @admin.action(description='تایید نظرات انتخاب شده')
    def approve_reviews(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} نظر با موفقیت تایید شد.')

@admin.register(SiteSetting)
class SiteSettingAdmin(ModelAdmin):
    def has_add_permission(self, request):
        if self.model.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        return False
