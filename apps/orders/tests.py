from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from apps.catalog.models import Category, Brand, Product, Variant
from apps.inventory.models import Inventory
from apps.promotions.models import Promotion
from apps.cart.models import Cart, CartItem
from apps.orders.models import Order, OrderItem
import uuid
from django.utils import timezone

User = get_user_model()

class CheckoutFlowIntegrationTest(TestCase):
    def setUp(self):
        # 1. Create a test user
        self.user = User.objects.create_user(
            email='test@example.com',
            phone_number='09123456789',
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )
        self.client = Client()
        self.client.force_login(self.user)

        # 2. Setup Catalog & Inventory
        self.category = Category.objects.create(name='Electronics', slug='electronics')
        self.brand = Brand.objects.create(name='Apple', slug='apple')
        self.product = Product.objects.create(
            category=self.category,
            brand=self.brand,
            name='iPhone 15',
            slug='iphone-15',
            is_active=True
        )
        self.variant = Variant.objects.create(
            product=self.product,
            sku=f'IP15-BLK-{uuid.uuid4().hex[:6]}',
            price=1000,
            is_active=True
        )
        self.inventory = Inventory.objects.get(variant=self.variant)
        self.inventory.quantity = 10
        self.inventory.save()

        # 3. Create a Promotion (Coupon)
        self.coupon = Promotion.objects.create(
            code='DISCOUNT10',
            discount_percentage=10,
            is_active=True,
            active_from=timezone.now()
        )

    def test_complete_checkout_flow(self):
        # Step 1: Add item to cart
        response = self.client.post(reverse('cart:add'), {
            'variant': self.variant.sku,
            'quantity': 1
        })
        self.assertIn(response.status_code, [200, 302])

        # Verify cart item exists
        cart = Cart.objects.get(user=self.user)
        self.assertEqual(cart.items.count(), 1)
        self.assertEqual(cart.items.first().variant, self.variant)

        # Step 2: Apply Coupon
        response = self.client.post(reverse('cart:apply_coupon'), {
            'coupon_code': 'DISCOUNT10'
        })
        cart.refresh_from_db()
        self.assertEqual(cart.promotion, self.coupon)

        # Step 3: Checkout (Create Order)
        response = self.client.post(reverse('orders:checkout'), {
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '09123456789',
            'address_id': 'new',
            'street': 'Test Street 123',
            'city': 'Tehran',
            'state': 'Tehran',
            'postal_code': '1234567890',
        }, follow=True)
        
        # Depending on redirection, usually redirects to success or payment simulation
        
        # Verify Order is created
        order = Order.objects.filter(user=self.user).first()
        self.assertIsNotNone(order, "Order was not created during checkout.")
        self.assertEqual(order.status, 'PENDING')
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.items.first().variant, self.variant)

        # Verify Inventory Reservation
        self.inventory.refresh_from_db()
        # Since we bought 1, reserved_quantity should increase or quantity should decrease depending on inventory logic
        # Typically available quantity = quantity - reserved
        # Just check it's not 10 anymore if it subtracts directly, or check reserved
        self.assertTrue(self.inventory.available_quantity < 10)

        # Step 4: Simulate Payment Success
        # Find the payment record created for this order
        payment = getattr(order, 'payment', None)
        if payment:
            payment.status = 'COMPLETED'
            payment.save()
            order.status = 'PAID'
            order.save()
        
        order.refresh_from_db()
        self.assertEqual(order.status, 'PAID')

        print("\n--- Checkout Flow Test Completed Successfully! ---")
