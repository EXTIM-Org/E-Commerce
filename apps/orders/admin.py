from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from config.admin_mixins import LocalizedImportExportModelAdmin as ImportExportModelAdmin
from unfold.contrib.filters.admin import ChoicesCheckboxFilter, RangeDateFilter
from .models import Order, OrderItem
from apps.payments.models import Payment
from unfold.contrib.filters.admin import ChoicesCheckboxFilter

class OrderItemInline(TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('variant', 'sku_snapshot', 'name_snapshot', 'price_snapshot', 'quantity')
    can_delete = False
    
    # Hide "Add another" since items are fixed after checkout
    def has_add_permission(self, request, obj=None):
        return False

class PaymentInline(StackedInline):
    model = Payment
    extra = 0
    readonly_fields = ('provider', 'transaction_id', 'amount', 'status', 'created_at', 'updated_at')
    can_delete = False
    
    # Hide "Add another" since payment is managed by system
    def has_add_permission(self, request, obj=None):
        return False

@admin.register(Order)
class OrderAdmin(ModelAdmin, ImportExportModelAdmin):
    list_display = ('id', 'user', 'status', 'total_amount', 'created_at')
    list_display_links = ('id', 'status')
    list_filter = (
        ('status', ChoicesCheckboxFilter),
        ('created_at', RangeDateFilter),
    )
    list_filter_submit = True
    show_facets = admin.ShowFacets.ALWAYS
    search_fields = ('id', 'user__email', 'user__phone_number')
    search_help_text = "شماره سفارش (ID)، ایمیل و یا شماره موبایل"
    readonly_fields = ('user', 'subtotal_amount', 'discount_amount', 'total_amount', 'promotion', 'shipping_address', 'billing_address', 'created_at', 'updated_at')
    inlines = [OrderItemInline, PaymentInline]
    
    fieldsets = (
        ("اطلاعات اصلی", {
            "fields": ("user", "status", "created_at", "updated_at")
        }),
        ("اطلاعات مالی", {
            "fields": ("subtotal_amount", "discount_amount", "total_amount", "promotion")
        }),
        ("آدرس‌ها", {
            "fields": ("shipping_address", "billing_address")
        }),
    )

    actions = [
        'mark_as_pending',
        'mark_as_paid',
        'mark_as_shipped',
        'mark_as_delivered',
        'mark_as_return_requested',
        'mark_as_returned',
        'mark_as_refunded',
        'mark_as_cancelled'
    ]
    
    @admin.action(description="تغییر وضعیت به: در انتظار پرداخت")
    def mark_as_pending(self, request, queryset):
        updated = queryset.update(status='PENDING')
        self.message_user(request, f"وضعیت {updated} سفارش به «در انتظار پرداخت» تغییر یافت.")

    @admin.action(description="تغییر وضعیت به: پرداخت شده")
    def mark_as_paid(self, request, queryset):
        updated = queryset.update(status='PAID')
        self.message_user(request, f"وضعیت {updated} سفارش به «پرداخت شده» تغییر یافت.")

    @admin.action(description="تغییر وضعیت به: ارسال شده")
    def mark_as_shipped(self, request, queryset):
        updated = queryset.update(status='SHIPPED')
        self.message_user(request, f"وضعیت {updated} سفارش به «ارسال شده» تغییر یافت.")

    @admin.action(description="تغییر وضعیت به: تحویل داده شده")
    def mark_as_delivered(self, request, queryset):
        updated = queryset.update(status='DELIVERED')
        self.message_user(request, f"وضعیت {updated} سفارش به «تحویل داده شده» تغییر یافت.")

    @admin.action(description="تغییر وضعیت به: درخواست مرجوعی")
    def mark_as_return_requested(self, request, queryset):
        updated = queryset.update(status='RETURN_REQUESTED')
        self.message_user(request, f"وضعیت {updated} سفارش به «درخواست مرجوعی» تغییر یافت.")
        
    @admin.action(description="تغییر وضعیت به: مرجوع شده")
    def mark_as_returned(self, request, queryset):
        updated = queryset.update(status='RETURNED')
        self.message_user(request, f"وضعیت {updated} سفارش به «مرجوع شده» تغییر یافت.")
        
    @admin.action(description="تغییر وضعیت به: مبلغ مسترد شده")
    def mark_as_refunded(self, request, queryset):
        updated = queryset.update(status='REFUNDED')
        self.message_user(request, f"وضعیت {updated} سفارش به «مبلغ مسترد شده» تغییر یافت.")
        
    @admin.action(description="تغییر وضعیت به: لغو شده")
    def mark_as_cancelled(self, request, queryset):
        updated = queryset.update(status='CANCELLED')
        self.message_user(request, f"وضعیت {updated} سفارش به «لغو شده» تغییر یافت.")
