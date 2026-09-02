from django.db import models
from django.conf import settings
from apps.catalog.models import Variant
from apps.users.models import Address

class Order(models.Model):
    """
    Represents a finalized customer order. 
    Tracks the lifecycle of an order from PENDING to DELIVERED/CANCELLED.
    Stores all financial totals and associated addresses at the time of purchase.
    """
    STATUS_CHOICES = [
        ('PENDING', 'در انتظار پرداخت'),
        ('PAID', 'پرداخت شده'),
        ('SHIPPED', 'ارسال شده'),
        ('DELIVERED', 'تحویل داده شده'),
        ('RETURN_REQUESTED', 'درخواست مرجوعی'),
        ('RETURNED', 'مرجوع شده'),
        ('REFUNDED', 'مبلغ مسترد شده'),
        ('CANCELLED', 'لغو شده'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders', verbose_name="کاربر")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name="وضعیت سفارش")
    
    # Financials
    subtotal_amount = models.DecimalField(max_digits=10, decimal_places=0, default=0, verbose_name="مبلغ اولیه")
    discount_amount = models.DecimalField(max_digits=10, decimal_places=0, default=0, verbose_name="مبلغ تخفیف")
    total_amount = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="مبلغ نهایی")
    
    # Applied Promotion (Coupon)
    promotion = models.ForeignKey('promotions.Promotion', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="کد تخفیف اعمال شده")
    
    shipping_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="آدرس ارسال")
    billing_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="آدرس صورتحساب")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاریخ بروزرسانی")

    class Meta:
        verbose_name = "سفارش"
        verbose_name_plural = "سفارشات"

    def __str__(self):
        return f"سفارش #{self.id} - {self.get_status_display()}"

class OrderItem(models.Model):
    """
    Represents an individual item within an Order.
    Important: Stores snapshots of the name, price, and SKU at the time of purchase
    so that if the product is later modified or deleted, the historical order record remains intact.
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name="سفارش")
    variant = models.ForeignKey(Variant, on_delete=models.SET_NULL, null=True, verbose_name="محصول (متغیر)")
    sku_snapshot = models.CharField(max_length=100, verbose_name="کد کالا در زمان ثبت")
    name_snapshot = models.CharField(max_length=255, verbose_name="نام کالا در زمان ثبت")
    price_snapshot = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="قیمت در زمان ثبت")
    quantity = models.PositiveIntegerField(verbose_name="تعداد")

    class Meta:
        verbose_name = "آیتم سفارش"
        verbose_name_plural = "آیتم‌های سفارش"

    def __str__(self):
        return f"{self.quantity} عدد از {self.sku_snapshot} (سفارش #{self.order.id})"
