from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    path('checkout/', views.checkout, name='checkout'),
    path('history/', views.order_history, name='history'),
    path('cancel/<int:order_id>/', views.cancel_order, name='cancel'),
    path('success/<int:order_id>/', views.order_success, name='success'),
    path('failed/<int:order_id>/', views.order_failed, name='failed'),
    path('tracking/<int:order_id>/', views.order_tracking, name='tracking'),
]
