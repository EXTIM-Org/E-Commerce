from django.db import models
from django.conf import settings
from apps.catalog.models import Variant

from apps.promotions.models import Promotion, CartRule
from decimal import Decimal

class Cart(models.Model):
    """
    Represents a shopping cart for a user or a guest session.
    It can hold multiple CartItems and optionally a Promotion code.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='cart', verbose_name="کاربر")
    session_id = models.CharField(max_length=255, null=True, blank=True, verbose_name="شناسه نشست")
    promotion = models.ForeignKey(Promotion, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="کد تخفیف (کد پروموشن)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاریخ بروزرسانی")

    class Meta:
        verbose_name = "سبد خرید"
        verbose_name_plural = "سبدهای خرید"

    def get_subtotal(self):
        """
        Calculates the total price of all items in the cart before any discounts.
        """
        return sum(item.variant.price * item.quantity for item in self.items.all())

    def get_discount_total(self):
        """
        Calculates the total discount amount to be applied based on the 
        applied promotion code and any active global cart rules.
        """
        subtotal = self.get_subtotal()
        discount = Decimal('0.00')
        
        # Apply coupon if valid
        if self.promotion and self.promotion.is_valid(subtotal):
            discount += self.promotion.get_discount_amount(subtotal)
            
        # Apply cart rules
        # Assuming they stack. If only one should apply, we can order by discount and take first.
        active_rules = CartRule.objects.filter(is_active=True, min_cart_total__lte=subtotal)
        for rule in active_rules:
            if rule.discount_percentage:
                rule_discount = (subtotal * rule.discount_percentage) / 100
                discount += rule_discount
                
        # Make sure discount does not exceed subtotal
        return min(discount, subtotal)

    def get_final_total(self):
        """
        Returns the final amount to be paid after all discounts are applied.
        """
        return self.get_subtotal() - self.get_discount_total()

    def get_active_cart_rules(self):
        """
        Returns a queryset of currently active CartRules applicable to this cart.
        """
        subtotal = self.get_subtotal()
        return CartRule.objects.filter(is_active=True, min_cart_total__lte=subtotal)

    def has_free_shipping(self):
        """
        Checks if any of the active cart rules grants free shipping.
        """
        for rule in self.get_active_cart_rules():
            if rule.is_free_shipping:
                return True
        return False

    def __str__(self):
        return f"سبد خرید {self.id}"

class CartItem(models.Model):
    """
    Represents an individual item (Variant) added to a Cart, along with its quantity.
    """
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items', verbose_name="سبد خرید")
    variant = models.ForeignKey(Variant, on_delete=models.CASCADE, verbose_name="محصول (متغیر)")
    quantity = models.PositiveIntegerField(default=1, verbose_name="تعداد")
    added_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ افزودن")

    class Meta:
        verbose_name = "آیتم سبد خرید"
        verbose_name_plural = "آیتم‌های سبد خرید"

    def __str__(self):
        return f"{self.quantity} عدد از {self.variant.sku}"
