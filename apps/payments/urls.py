from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('simulate/<int:order_id>/', views.simulate_gateway, name='simulate'),
    path('process/<int:order_id>/', views.process_payment, name='process'),
]
