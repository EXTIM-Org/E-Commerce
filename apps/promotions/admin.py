from django.contrib import admin
from .models import Promotion, CartRule, HeroBanner

@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percentage', 'discount_fixed', 'is_active', 'active_from', 'active_until')
    search_fields = ('code',)
    list_filter = ('is_active',)
    ordering = ('-active_from',)

@admin.register(CartRule)
class CartRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'min_cart_total', 'discount_percentage', 'is_free_shipping', 'is_active')
    search_fields = ('name',)
    list_filter = ('is_active', 'is_free_shipping')
    ordering = ('-id',)

@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ('title_main', 'is_active')
    search_fields = ('title_main',)
    list_filter = ('is_active',)
    ordering = ('-id',)
