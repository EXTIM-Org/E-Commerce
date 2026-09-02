import os
import django
import sys

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.catalog.models import Category, Brand, Product, Variant

def seed():
    # Create Categories
    cat_electronics, _ = Category.objects.get_or_create(name='Electronics', slug='electronics', description='Gadgets and devices')
    cat_clothing, _ = Category.objects.get_or_create(name='Clothing', slug='clothing', description='Apparel and fashion')

    # Create Brands
    brand_apple, _ = Brand.objects.get_or_create(name='Apple', slug='apple')
    brand_nike, _ = Brand.objects.get_or_create(name='Nike', slug='nike')
    brand_sony, _ = Brand.objects.get_or_create(name='Sony', slug='sony')

    # Create Products
    p1, _ = Product.objects.get_or_create(
        name='MacBook Pro 16"',
        slug='macbook-pro-16',
        category=cat_electronics,
        brand=brand_apple,
        description='Supercharged for pros. The most powerful MacBook Pro ever is here. With the blazing-fast M1 Pro or M1 Max chip.',
        is_active=True
    )
    
    p2, _ = Product.objects.get_or_create(
        name='Air Force 1',
        slug='air-force-1',
        category=cat_clothing,
        brand=brand_nike,
        description='The radiance lives on in the Nike Air Force 1 ’07, the b-ball icon that puts a fresh spin on what you know best.',
        is_active=True
    )

    p3, _ = Product.objects.get_or_create(
        name='Sony WH-1000XM5',
        slug='sony-wh-1000xm5',
        category=cat_electronics,
        brand=brand_sony,
        description='Industry-leading noise canceling with two processors controlling 8 microphones.',
        is_active=True
    )

    # Create Variants
    Variant.objects.get_or_create(product=p1, sku='MAC-16-512', name='512GB SSD Space Gray', price='2499.00')
    Variant.objects.get_or_create(product=p1, sku='MAC-16-1TB', name='1TB SSD Space Gray', price='2699.00')
    
    Variant.objects.get_or_create(product=p2, sku='AF1-WHT-10', name='White - Size 10', price='110.00')
    Variant.objects.get_or_create(product=p2, sku='AF1-BLK-10', name='Black - Size 10', price='110.00')

    Variant.objects.get_or_create(product=p3, sku='SONY-XM5-BLK', name='Black', price='398.00')

    print("Successfully seeded the database with sample products.")

if __name__ == '__main__':
    seed()
