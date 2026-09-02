from django.db import models
from apps.orders.models import Order

class Payment(models.Model):
    """
    Represents a payment transaction for an Order.
    Tracks the provider (e.g., ZarinPal, Stripe, or a dummy provider), 
    the external transaction ID, the amount, and the current payment status.
    Linked One-to-One with Order, assuming one payment attempt is stored at a time 
    or only the definitive payment record is kept.
    """
    STATUS_CHOICES = [
        ('PENDING', 'در انتظار پرداخت'),
        ('COMPLETED', 'موفق'),
        ('FAILED', 'ناموفق'),
        ('REFUNDED', 'مسترد شده'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment', verbose_name="سفارش")
    provider = models.CharField(max_length=50, default='dummy_provider', verbose_name="درگاه پرداخت")
    transaction_id = models.CharField(max_length=255, blank=True, null=True, verbose_name="کد رهگیری تراکنش")
    amount = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="مبلغ")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name="وضعیت")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاریخ بروزرسانی")

    class Meta:
        verbose_name = "پرداخت"
        verbose_name_plural = "پرداخت‌ها"

    def __str__(self):
        return f"پرداخت {self.id} برای سفارش #{self.order.id}"
