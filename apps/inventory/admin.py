from django.contrib import admin
from unfold.admin import ModelAdmin
from config.admin_mixins import LocalizedImportExportModelAdmin as ImportExportModelAdmin
from .models import Inventory, StockReservation

@admin.register(Inventory)
class InventoryAdmin(ModelAdmin, ImportExportModelAdmin):
    list_display = ('variant', 'quantity')
    list_select_related = ('variant', 'variant__product')

@admin.register(StockReservation)
class StockReservationAdmin(ModelAdmin, ImportExportModelAdmin):
    pass
