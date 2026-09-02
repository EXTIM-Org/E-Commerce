from django.urls import path
from . import views

app_name = 'catalog'

urlpatterns = [
    path('', views.home, name='home'),
    path('search/', views.search_products, name='search'),
    path('product/<slug:slug>/', views.product_detail, name='product_detail'),
    path('review/<int:review_id>/like/', views.like_review, name='like_review'),
    path('review/<int:review_id>/dislike/', views.dislike_review, name='dislike_review'),
]
