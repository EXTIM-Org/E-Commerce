from django.db import models
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from PIL import Image

def validate_image_size(value):
    """
    Validator to ensure the uploaded image file does not exceed 2MB.
    Raises ValidationError if the file is too large.
    """
    filesize = value.size
    if filesize > 2 * 1024 * 1024:
        raise ValidationError("حداکثر حجم مجاز برای عکس ۲ مگابایت است.")

class SiteSetting(models.Model):
    """
    Singleton model for site-wide settings.
    Stores dynamic configurations that can be modified via the admin panel, 
    such as the cache timeout for the homepage.
    """
    home_cache_timeout = models.IntegerField(default=15, help_text="مدت زمان کش شدن صفحه اصلی به دقیقه", verbose_name="زمان کش صفحه اصلی (دقیقه)")

    class Meta:
        verbose_name = "تنظیمات سایت"
        verbose_name_plural = "تنظیمات سایت"

    def __str__(self):
        return "تنظیمات کلی سایت"

    def save(self, *args, **kwargs):
        """
        Overrides save to ensure only one instance of SiteSetting exists (Singleton pattern).
        Clears the homepage cache when settings are changed to apply new timeouts immediately.
        """
        self.pk = 1
        super().save(*args, **kwargs)
        
        from django.core.cache import cache
        cache.delete_many(['home_products', 'home_categories', 'home_banner'])
        
    @classmethod
    def load(cls):
        """
        Class method to retrieve the single instance of SiteSetting, creating it if it doesn't exist.
        """
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

class Category(models.Model):
    """
    Represents a product category. Supports hierarchical categories via a self-referential parent field.
    """
    name = models.CharField(max_length=100, verbose_name="نام دسته‌بندی")
    slug = models.SlugField(unique=True, blank=True, allow_unicode=True, verbose_name="شناسه URL (اسلاگ)")
    description = models.TextField(blank=True, verbose_name="توضیحات")
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children', verbose_name="دسته‌بندی پدر")

    class Meta:
        verbose_name = "دسته‌بندی"
        verbose_name_plural = "دسته‌بندی‌ها"

    def save(self, *args, **kwargs):
        """
        Automatically generates a slug from the name if one is not provided.
        """
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
            if not self.slug:
                import uuid
                self.slug = f"cat-{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Brand(models.Model):
    """
    Represents a product brand.
    """
    name = models.CharField(max_length=100, verbose_name="نام برند")
    slug = models.SlugField(unique=True, blank=True, allow_unicode=True, verbose_name="شناسه URL (اسلاگ)")

    class Meta:
        verbose_name = "برند"
        verbose_name_plural = "برندها"

    def save(self, *args, **kwargs):
        """
        Automatically generates a slug from the name if one is not provided.
        """
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
            if not self.slug:
                import uuid
                self.slug = f"brand-{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Product(models.Model):
    """
    Represents a core product. Actual purchasable items are tied to this via the Variant model.
    Contains shared attributes like name, brand, category, and main image.
    """
    name = models.CharField(max_length=255, verbose_name="نام محصول")
    slug = models.SlugField(unique=True, blank=True, allow_unicode=True, verbose_name="شناسه URL (اسلاگ)")
    description = models.TextField(verbose_name="توضیحات")
    detailed_description = models.TextField(blank=True, null=True, verbose_name="توضیحات مشروح")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products', verbose_name="دسته‌بندی")
    brand = models.ForeignKey(Brand, on_delete=models.PROTECT, related_name='products', null=True, blank=True, verbose_name="برند")
    image = models.ImageField(upload_to='products/', blank=True, null=True, validators=[validate_image_size], verbose_name="تصویر اصلی")
    is_active = models.BooleanField(default=True, verbose_name="فعال")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاریخ بروزرسانی")

    class Meta:
        verbose_name = "محصول"
        verbose_name_plural = "محصولات"

    def save(self, *args, **kwargs):
        """
        Automatically generates a slug. 
        Triggers a Celery background task to optimize the main image if a new one is uploaded.
        """
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
            if not self.slug:
                import uuid
                self.slug = f"prod-{uuid.uuid4().hex[:8]}"
            
        from django.core.files.uploadedfile import UploadedFile
        trigger_optimize = False
        if self.image and hasattr(self.image, 'file') and isinstance(self.image.file, UploadedFile):
            trigger_optimize = True
            
        super().save(*args, **kwargs)
        
        if trigger_optimize:
            from common.tasks import optimize_image_task
            optimize_image_task.delay('catalog', 'Product', self.pk, 'image', 800, 800, 80, 'WEBP')

    def __str__(self):
        return self.name

    @property
    def has_stock(self):
        """
        Returns True if at least one variant of this product has available stock.
        """
        return any(variant.available_quantity > 0 for variant in self.variants.all())

    @property
    def total_available_quantity(self):
        """
        Returns the combined available stock quantity of all variants for this product.
        """
        return sum(variant.available_quantity for variant in self.variants.all())

    @property
    def average_rating(self):
        """
        Calculates the average rating from all approved reviews for this product.
        Returns 0 if there are no approved reviews.
        """
        approved_reviews = self.reviews.filter(is_approved=True)
        if approved_reviews.exists():
            return round(approved_reviews.aggregate(models.Avg('rating'))['rating__avg'], 1)
        return 0

    @property
    def approved_reviews_count(self):
        """
        Returns the total number of approved reviews.
        """
        return self.reviews.filter(is_approved=True).count()

class Variant(models.Model):
    """
    Represents a specific purchasable variation of a Product (e.g., specific color/size).
    Each variant has its own price, SKU, and inventory tracking.
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants', verbose_name="محصول")
    sku = models.CharField(max_length=100, unique=True, verbose_name="کد کالا (SKU)")
    name = models.CharField(max_length=255, blank=True, help_text="مثال: مشکی ۲۵۶ گیگ", verbose_name="نام متغیر")
    price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="قیمت")
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=0, null=True, blank=True, help_text="قیمت قبل از تخفیف", verbose_name="قیمت خط خورده")
    is_active = models.BooleanField(default=True, verbose_name="فعال")

    class Meta:
        verbose_name = "متغیر محصول (گزینه)"
        verbose_name_plural = "متغیرهای محصول"

    @property
    def get_discount_percent(self):
        """
        Calculates the discount percentage based on compare_at_price and current price.
        Returns 0 if no discount exists.
        """
        if self.compare_at_price and self.compare_at_price > self.price:
            discount = ((self.compare_at_price - self.price) / self.compare_at_price) * 100
            return int(discount)
        return 0

    @property
    def available_quantity(self):
        """
        Fetches the real-time available inventory quantity for this variant.
        Handles cases where the related Inventory record might not exist yet.
        """
        try:
            return self.inventory.available_quantity
        except Exception:
            return 0

    def __str__(self):
        return f"{self.product.name} - {self.sku}"

class ProductImage(models.Model):
    """
    Represents secondary/gallery images for a Product.
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images', verbose_name="محصول")
    image = models.ImageField(upload_to='products/gallery/', validators=[validate_image_size], blank=True, null=True, verbose_name="تصویر")
    alt_text = models.CharField(max_length=255, blank=True, help_text="متن جایگزین برای سئو", verbose_name="متن جایگزین (Alt)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")

    class Meta:
        ordering = ['created_at']
        verbose_name = "تصویر گالری"
        verbose_name_plural = "تصاویر گالری"

    def save(self, *args, **kwargs):
        """
        Triggers a Celery background task to optimize the gallery image if a new one is uploaded.
        """
        from django.core.files.uploadedfile import UploadedFile
        trigger_optimize = False
        if self.image and hasattr(self.image, 'file') and isinstance(self.image.file, UploadedFile):
            trigger_optimize = True
            
        super().save(*args, **kwargs)
        
        if trigger_optimize:
            from common.tasks import optimize_image_task
            optimize_image_task.delay('catalog', 'ProductImage', self.pk, 'image', 800, 800, 80, 'WEBP')

    def __str__(self):
        return f"Image for {self.product.name}"

class Review(models.Model):
    """
    Represents a user review or a reply to a review for a specific Product.
    Includes rating, likes/dislikes, and approval status.
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', verbose_name="محصول")
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='reviews', verbose_name="کاربر")
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)], null=True, blank=True, verbose_name="امتیاز")
    comment = models.TextField(blank=True, verbose_name="متن نظر")
    is_approved = models.BooleanField(default=False, verbose_name="تایید شده")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', verbose_name="پاسخ به")
    recommend = models.BooleanField(null=True, blank=True, verbose_name="پیشنهاد خرید")
    likes = models.ManyToManyField('users.User', related_name='liked_reviews', blank=True, verbose_name="لایک‌ها")
    dislikes = models.ManyToManyField('users.User', related_name='disliked_reviews', blank=True, verbose_name="دیس‌لایک‌ها")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "نظر"
        verbose_name_plural = "نظرات"

    @property
    def is_verified_buyer(self):
        """
        Checks if the user has successfully purchased and received the product.
        """
        from apps.orders.models import OrderItem
        return OrderItem.objects.filter(order__user=self.user, order__status='DELIVERED', variant__product=self.product).exists()

    @property
    def is_admin_reply(self):
        """
        Identifies if this review/reply was posted by a staff member or superuser.
        """
        return self.user.is_staff or self.user.is_superuser

    def __str__(self):
        return f"نظر {self.user.email} برای {self.product.name}"
