from django.contrib import admin
from unfold.admin import ModelAdmin
from config.admin_mixins import LocalizedImportExportModelAdmin as ImportExportModelAdmin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(ModelAdmin, ImportExportModelAdmin):
    pass
