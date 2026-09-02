from django.db import transaction
from django.utils import timezone
from apps.cart.models import Cart
from apps.inventory.models import Inventory, StockReservation
from apps.orders.models import Order, OrderItem
from apps.payments.models import Payment

class CheckoutService:
    @staticmethod
    def reserve_stock(cart):
        """
        Validates cart and reserves stock using select_for_update.
        """
        reservations = []
        with transaction.atomic():
            for item in cart.items.all():
                # Lock the inventory row
                inventory = Inventory.objects.select_for_update().get(variant=item.variant)
                if inventory.quantity < item.quantity:
                    raise ValueError(f"Not enough stock for {item.variant.sku}")
                
                # Create reservation
                reservation = StockReservation.objects.create(
                    variant=item.variant,
                    quantity=item.quantity,
                    expires_at=timezone.now() + timezone.timedelta(minutes=15)
                )
                
                # Deduct temporarily
                inventory.quantity -= item.quantity
                inventory.save()
                
                reservations.append(reservation)
        return reservations
        
    @staticmethod
    def complete_checkout(cart, user, shipping_address, billing_address):
        with transaction.atomic():
            reservations = CheckoutService.reserve_stock(cart)
            
            # Create Order
            total_amount = sum(item.quantity * item.variant.price for item in cart.items.all())
            order = Order.objects.create(
                user=user,
                total_amount=total_amount,
                shipping_address=shipping_address,
                billing_address=billing_address,
                status='PENDING'
            )
            
            # Create Order Items
            for item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    variant=item.variant,
                    sku_snapshot=item.variant.sku,
                    name_snapshot=item.variant.name,
                    price_snapshot=item.variant.price,
                    quantity=item.quantity
                )
            
            # Create Payment Intent (dummy)
            payment = Payment.objects.create(
                order=order,
                amount=total_amount,
                provider='dummy_provider'
            )
            
            # Clear Cart
            cart.items.all().delete()
            
            return order, payment

    @staticmethod
    def confirm_payment(payment_id):
        with transaction.atomic():
            payment = Payment.objects.select_for_update().get(id=payment_id)
            if payment.status == 'COMPLETED':
                return
            payment.status = 'COMPLETED'
            payment.save()
            
            order = payment.order
            order.status = 'PAID'
            order.save()
