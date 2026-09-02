from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from apps.orders.models import Order
from apps.payments.models import Payment
from apps.cart.models import Cart
from django.contrib import messages

@login_required
def simulate_gateway(request, order_id):
    """
    Renders a dummy payment gateway page for testing purposes.
    Ensures the order's payment status is still PENDING before proceeding.
    """
    order = get_object_or_404(Order, id=order_id, user=request.user)
    payment = get_object_or_404(Payment, order=order)
    
    if payment.status != 'PENDING':
        messages.error(request, 'این سفارش قبلا پرداخت شده یا منقضی شده است.')
        return redirect('orders:checkout')
        
    return render(request, 'payments/gateway.html', {'order': order, 'payment': payment})

@login_required
def process_payment(request, order_id):
    """
    Handles the callback/action from the payment gateway.
    On success:
      - Marks payment as COMPLETED.
      - Marks order as PAID.
      - Deducts reserved stock from physical inventory.
      - Clears active reservations.
      - Increments promotion usage count.
      - Empties the user's cart.
    On failure:
      - Marks payment as FAILED.
      - Clears active reservations, freeing up stock for other users.
    """
    if request.method == 'POST':
        order = get_object_or_404(Order, id=order_id, user=request.user)
        payment = get_object_or_404(Payment, order=order)
        action = request.POST.get('action')
        
        if action == 'success':
            payment.status = 'COMPLETED'
            payment.transaction_id = f'SIM-{payment.id}-OK'
            payment.save()
            
            order.status = 'PAID'
            order.save()
            
            # Decrement inventory and clear reservations
            for reservation in order.reservations.all():
                if reservation.is_active:
                    inventory = reservation.variant.inventory
                    inventory.quantity = max(0, inventory.quantity - reservation.quantity)
                    inventory.save()
                    reservation.is_active = False
                    reservation.save()

            # Increment promotion times_used
            if order.promotion:
                order.promotion.times_used += 1
                order.promotion.save()
                
            # Clear cart
            Cart.objects.filter(user=request.user).delete()
            
            return redirect('orders:success', order_id=order.id)
            
        elif action == 'fail':
            payment.status = 'FAILED'
            payment.save()
            
            # Clear reservations
            for reservation in order.reservations.all():
                reservation.is_active = False
                reservation.save()
                
            # Keep order as PENDING so they can retry, or mark as CANCELLED
            return redirect('orders:failed', order_id=order.id)
            
    return redirect('catalog:home')
