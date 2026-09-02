from django.db import models
from apps.catalog.models import Variant

class Inventory(models.Model):
    """
    Manages the absolute physical stock quantity for a specific product Variant.
    Linked One-to-One with Variant to ensure atomic inventory updates.
    """
    variant = models.OneToOneField(Variant, on_delete=models.CASCADE, related_name='inventory', verbose_name="محصول (متغیر)")
    quantity = models.PositiveIntegerField(default=0, verbose_name="تعداد موجودی قطعی")

    class Meta:
        verbose_name = "موجودی انبار"
        verbose_name_plural = "موجودی‌های انبار"

    @property
    def available_quantity(self):
        """
        Calculates the real available stock by subtracting active, unexpired 
        temporary stock reservations from the absolute physical stock.
        """
        from django.utils import timezone
        from django.db.models import Sum
        active_reservations = self.variant.reservations.filter(
            is_active=True,
            expires_at__gt=timezone.now()
        ).aggregate(total=Sum('quantity'))['total'] or 0
        return max(0, self.quantity - active_reservations)

    def __str__(self):
        return f"{self.variant.sku} - {self.quantity} عدد موجود"

class StockReservation(models.Model):
    """
    Represents a temporary lock on inventory items.
    Created during checkout to prevent overselling while a user completes payment.
    Reservations expire automatically based on expires_at or can be manually deactivated.
    """
    variant = models.ForeignKey(Variant, on_delete=models.CASCADE, related_name='reservations', verbose_name="محصول (متغیر)")
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='reservations', null=True, blank=True, verbose_name="سفارش مرتبط")
    quantity = models.PositiveIntegerField(verbose_name="تعداد رزرو شده")
    session_id = models.CharField(max_length=255, null=True, blank=True, verbose_name="شناسه نشست (Session)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")
    expires_at = models.DateTimeField(verbose_name="تاریخ انقضای رزرو")
    is_active = models.BooleanField(default=True, verbose_name="فعال")

    class Meta:
        verbose_name = "رزرو موقت موجودی"
        verbose_name_plural = "رزروهای موقت موجودی"

    def __str__(self):
        return f"رزرو {self.quantity} عدد از {self.variant.sku}"
