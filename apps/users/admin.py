from django.contrib import admin
from unfold.admin import ModelAdmin
from config.admin_mixins import LocalizedImportExportModelAdmin as ImportExportModelAdmin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from .models import User, Address
from .forms import CustomUserCreationForm, CustomUserChangeForm

@admin.register(User)
class UserAdmin(DefaultUserAdmin, ModelAdmin, ImportExportModelAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = ['email', 'is_staff', 'is_active']
    search_fields = ['email']
    ordering = ['email']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number', 'avatar')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password'),
        }),
    )

@admin.register(Address)
class AddressAdmin(ModelAdmin, ImportExportModelAdmin):
    list_display = ('user', 'street', 'city', 'country', 'is_default')
