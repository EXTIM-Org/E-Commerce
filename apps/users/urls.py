from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('login/', views.auth_view, name='login'),
    path('signup/', views.auth_view, name='signup'),
    path('profile/', views.profile_dashboard, name='profile'),
    path('profile/addresses/', views.manage_addresses, name='addresses'),
    path('profile/addresses/delete/<int:address_id>/', views.delete_address, name='delete_address'),
]
