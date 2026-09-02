from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.catalog.models import Variant
from .models import Inventory

@receiver(post_save, sender=Variant)
def create_inventory_for_variant(sender, instance, created, **kwargs):
    if created:
        Inventory.objects.create(variant=instance, quantity=0)

@receiver(post_save, sender=Inventory)
def clear_product_cache_on_inventory_update(sender, instance, **kwargs):
    from django.core.cache import cache
    cache.delete('home_products')
