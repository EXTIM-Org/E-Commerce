from django.db import models
from django.core.exceptions import ValidationError

def validate_banner_size(value):
    """
    Validator to ensure uploaded banners do not exceed 3MB.
    """
    filesize = value.size
    if filesize > 3 * 1024 * 1024:
        raise ValidationError("حداکثر حجم مجاز برای بنر ۳ مگابایت است.")

class Promotion(models.Model):
    """
    Represents a discount coupon code that users can apply in their cart.
    Supports fixed amounts or percentage discounts, usage limits, 
    time boundaries, and minimum cart values.
    """
    code = models.CharField(max_length=50, unique=True, help_text="کد تخفیف", verbose_name="کد")
    description = models.TextField(blank=True, verbose_name="توضیحات")
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="درصد (مثلا 10.00 برای ۱۰٪)", null=True, blank=True, verbose_name="درصد تخفیف")
    discount_fixed = models.DecimalField(max_digits=10, decimal_places=0, help_text="مبلغ ثابت تخفیف", null=True, blank=True, verbose_name="مبلغ ثابت تخفیف")
    active_from = models.DateTimeField(verbose_name="فعال از تاریخ")
    active_until = models.DateTimeField(null=True, blank=True, verbose_name="فعال تا تاریخ")
    is_active = models.BooleanField(default=True, verbose_name="فعال")
    
    # New fields for advanced coupon rules
    usage_limit = models.PositiveIntegerField(null=True, blank=True, help_text="حداکثر دفعات مجاز استفاده از این کد", verbose_name="محدودیت استفاده")
    times_used = models.PositiveIntegerField(default=0, verbose_name="دفعات استفاده شده")
    minimum_cart_value = models.DecimalField(max_digits=10, decimal_places=0, null=True, blank=True, help_text="حداقل مبلغ سبد خرید برای استفاده از این کد", verbose_name="حداقل سبد خرید")

    class Meta:
        verbose_name = "کد تخفیف"
        verbose_name_plural = "کدهای تخفیف"

    def is_valid(self, cart_total=0):
        """
        Validates if the promotion is currently active, within usage limits, 
        and meets the minimum cart total requirement.
        """
        if not self.is_active:
            return False
        
        # Check date (Assuming active_from is checked elsewhere or we use timezone.now())
        from django.utils import timezone
        now = timezone.now()
        if self.active_from > now:
            return False
        if self.active_until and self.active_until < now:
            return False
            
        # Check usage limits
        if self.usage_limit is not None and self.times_used >= self.usage_limit:
            return False
            
        # Check minimum cart value
        if self.minimum_cart_value is not None and cart_total < self.minimum_cart_value:
            return False
            
        return True

    def get_discount_amount(self, cart_total):
        """
        Calculates the actual discount monetary amount for a given cart total.
        Ensures a fixed discount cannot exceed the cart total.
        """
        if self.discount_percentage:
            return (cart_total * self.discount_percentage) / 100
        elif self.discount_fixed:
            return min(self.discount_fixed, cart_total) # Cannot discount more than total
        return 0

    def __str__(self):
        return self.code

class CartRule(models.Model):
    """
    Represents global cart rules that automatically apply to all carts if criteria are met 
    (e.g., "Free shipping for orders over $50"). No coupon code required.
    """
    name = models.CharField(max_length=255, help_text="مثلا: ارسال رایگان برای خریدهای بالای ۵ میلیون", verbose_name="نام قانون")
    description = models.TextField(blank=True, verbose_name="توضیحات")
    min_cart_total = models.DecimalField(max_digits=10, decimal_places=0, help_text="حداقل مبلغ سبد خرید برای اعمال این قانون", verbose_name="حداقل سبد خرید")
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="درصد تخفیف روی کل سبد خرید", verbose_name="درصد تخفیف")
    is_free_shipping = models.BooleanField(default=False, verbose_name="ارسال رایگان")
    is_active = models.BooleanField(default=True, verbose_name="فعال")

    class Meta:
        verbose_name = "قانون سبد خرید"
        verbose_name_plural = "قوانین سبد خرید"
    
    def __str__(self):
        return self.name

class HeroBanner(models.Model):
    """
    Dynamic homepage banner model.
    Allows admins to configure the large hero section at the top of the homepage.
    """
    tagline = models.CharField(max_length=100, default="🔥 کالکشن جدید", verbose_name="تگ بالای عنوان")
    title_main = models.CharField(max_length=255, default="تکنولوژی را زندگی کن", verbose_name="عنوان اصلی")
    title_highlight = models.CharField(max_length=100, default="به سبک خودت", verbose_name="بخش رنگی عنوان (گرادیانت)", blank=True)
    description = models.TextField(verbose_name="متن توضیحات")
    button_text = models.CharField(max_length=50, default="خرید را شروع کنید", verbose_name="متن دکمه اصلی")
    button_link = models.CharField(max_length=255, default="#products", verbose_name="لینک دکمه اصلی (مثلا /search/)")
    image = models.ImageField(upload_to='banners/', validators=[validate_banner_size], verbose_name="تصویر بنر", blank=True, null=True)
    is_active = models.BooleanField(default=True, verbose_name="فعال (نمایش در سایت)")

    class Meta:
        verbose_name = "بنر صفحه اصلی"
        verbose_name_plural = "بنرهای صفحه اصلی"

    def save(self, *args, **kwargs):
        """
        Triggers a background Celery task to optimize the hero banner image if newly uploaded.
        """
        from django.core.files.uploadedfile import UploadedFile
        trigger_optimize = False
        if self.image and hasattr(self.image, 'file') and isinstance(self.image.file, UploadedFile):
            trigger_optimize = True
            
        super().save(*args, **kwargs)
        
        if trigger_optimize:
            from common.tasks import optimize_image_task
            optimize_image_task.delay('promotions', 'HeroBanner', self.pk, 'image', 1920, 1080, 85, 'WEBP')

    def __str__(self):
        return self.title_main
