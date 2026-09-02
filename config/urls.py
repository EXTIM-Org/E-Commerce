"""
Main URL Configuration for the E-Commerce minimal project.

This module routes URLs to their corresponding application views.
It includes the Django admin panel and routes for all major subsystems:
users, cart, orders, payments, and the main product catalog.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django Admin Panel
    path('admin/', admin.site.urls),
    
    # User Authentication and Account Management
    path('users/', include('apps.users.urls')),
    path('users/', include('django.contrib.auth.urls')),
    
    # Shopping Cart Functionality
    path('cart/', include('apps.cart.urls')),
    
    # Order Placement and History
    path('orders/', include('apps.orders.urls')),
    
    # Payment Processing and Gateways
    path('payments/', include('apps.payments.urls')),
    
    # Product Catalog and Homepage (Catch-all, should be placed last)
    path('', include('apps.catalog.urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
