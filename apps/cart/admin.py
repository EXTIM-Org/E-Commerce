from django.contrib import admin
from django.shortcuts import redirect
from django.utils import timezone
from datetime import timedelta
from django.contrib import messages
from unfold.admin import ModelAdmin, TabularInline
from config.admin_mixins import LocalizedImportExportModelAdmin as ImportExportModelAdmin
from unfold.decorators import action
from apps.inventory.models import StockReservation
from .models import Cart, CartItem

class CartItemInline(TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('variant', 'quantity', 'added_at')
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False

@admin.register(Cart)
class CartAdmin(ModelAdmin, ImportExportModelAdmin):
    list_display = ('id', 'user', 'session_id', 'created_at', 'updated_at')
    list_display_links = ('id', 'user')
    search_fields = ('id', 'session_id', 'user__email', 'user__phone_number')
    search_help_text = "شناسه نشست، ایمیل و یا شماره موبایل"
    readonly_fields = ('user', 'session_id', 'promotion', 'created_at', 'updated_at')
    inlines = [CartItemInline]
    
    actions_list = ["cleanup_abandoned_carts"]

    @action(description="پاکسازی سبدهای رها شده")
    def cleanup_abandoned_carts(self, request):
        cutoff_time = timezone.now() - timedelta(hours=48)
        
        # Clean up abandoned carts older than 48h
        old_carts = Cart.objects.filter(updated_at__lt=cutoff_time)
        carts_count = old_carts.count()
        old_carts.delete()
        
        # Clean up expired stock reservations
        expired_reservations = StockReservation.objects.filter(expires_at__lt=timezone.now())
        res_count = expired_reservations.count()
        expired_reservations.delete()
        
        self.message_user(
            request, 
            f"عملیات با موفقیت انجام شد: {carts_count} سبد خرید رها شده و {res_count} رزرو موجودی منقضی‌شده پاک شدند.", 
            level=messages.SUCCESS
        )
        return redirect(request.META.get('HTTP_REFERER', 'admin:cart_cart_changelist'))
