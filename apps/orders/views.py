from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from apps.cart.models import Cart
from apps.users.models import Address
from apps.orders.models import Order, OrderItem
from apps.payments.models import Payment

@login_required
def checkout(request):
    """
    Handles the main checkout process.
    Validates the cart, manages shipping addresses, checks real-time inventory,
    creates the Order and OrderItems, reserves stock, and triggers payment and celery tasks.
    """
    try:
        cart = Cart.objects.get(user=request.user)
    except Cart.DoesNotExist:
        messages.error(request, 'سبد خرید شما خالی است.')
        return redirect('cart:detail')
        
    if not cart.items.exists():
        messages.error(request, 'سبد خرید شما خالی است.')
        return redirect('cart:detail')

    addresses = request.user.addresses.all()

    if request.method == 'POST':
        # Update user info if missing or new
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        phone = request.POST.get('phone_number')
        
        user_changed = False
        if first_name and first_name != request.user.first_name:
            request.user.first_name = first_name
            user_changed = True
        if last_name and last_name != request.user.last_name:
            request.user.last_name = last_name
            user_changed = True
        if phone and phone != request.user.phone_number:
            request.user.phone_number = phone
            user_changed = True
            
        from django.core.exceptions import ValidationError
        
        try:
            if user_changed:
                request.user.save()

            # Create a new address or use existing
            address_id = request.POST.get('address_id')
            if address_id == 'new':
                street = request.POST.get('street')
                city = request.POST.get('city')
                state = request.POST.get('state')
                postal_code = request.POST.get('postal_code')
                address = Address.objects.create(
                    user=request.user,
                    street=street,
                    city=city,
                    state=state,
                    postal_code=postal_code,
                    country='Iran'
                )
            elif address_id:
                address = get_object_or_404(Address, id=address_id, user=request.user)
            else:
                messages.error(request, 'لطفا یک آدرس انتخاب کنید یا آدرس جدید وارد نمایید.')
                return render(request, 'orders/checkout.html', {'cart': cart, 'addresses': addresses})
                
        except ValidationError as e:
            # Handle validation errors from models (e.g., regex, min_length)
            for field, errors in e.message_dict.items():
                for error in errors:
                    messages.error(request, f"{error}")
            return render(request, 'orders/checkout.html', {'cart': cart, 'addresses': addresses})

        # Check Inventory and Create Reservations
        from apps.inventory.models import StockReservation
        from django.utils import timezone
        import datetime

        # 1. Validate all items
        out_of_stock_items = []
        for item in cart.items.all():
            available_qty = item.variant.available_quantity
            if item.quantity > available_qty:
                out_of_stock_items.append(item.variant.product.name)
        
        if out_of_stock_items:
            messages.error(request, f'متاسفانه موجودی این محصولات به اتمام رسیده است: {", ".join(out_of_stock_items)}')
            return redirect('cart:detail')

        # Create Order
        subtotal = cart.get_subtotal()
        discount = cart.get_discount_total()
        final_total = cart.get_final_total()
        
        order = Order.objects.create(
            user=request.user,
            status='PENDING',
            subtotal_amount=subtotal,
            discount_amount=discount,
            total_amount=final_total,
            promotion=cart.promotion,
            shipping_address=address,
            billing_address=address
        )
        
        # Create Order Items and Reservations
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                variant=item.variant,
                sku_snapshot=item.variant.sku,
                name_snapshot=f"{item.variant.product.name} ({item.variant.name})" if item.variant.name else item.variant.product.name,
                price_snapshot=item.variant.price,
                quantity=item.quantity
            )
            # Create Reservation
            StockReservation.objects.create(
                variant=item.variant,
                order=order,
                quantity=item.quantity,
                expires_at=timezone.now() + datetime.timedelta(minutes=15)
            )
            
        # Create Payment intent
        Payment.objects.create(
            order=order,
            amount=final_total,
            status='PENDING'
        )
        
        # Trigger background task for email
        from apps.orders.tasks import send_order_confirmation
        send_order_confirmation.delay(order.id)
        
        return redirect('payments:simulate', order_id=order.id)

    return render(request, 'orders/checkout.html', {
        'cart': cart,
        'addresses': addresses
    })

@login_required
def order_success(request, order_id):
    """
    Renders the success page after a successful payment or order placement.
    """
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return render(request, 'orders/success.html', {'order': order})

@login_required
def order_failed(request, order_id):
    """
    Renders the failure page if payment fails or order is rejected.
    """
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return render(request, 'orders/failed.html', {'order': order})

@login_required
def order_history(request):
    """
    Displays a list of all past orders for the authenticated user.
    """
    orders = request.user.orders.all().order_by('-created_at')
    return render(request, 'orders/history.html', {
        'orders': orders
    })

@login_required
def cancel_order(request, order_id):
    """
    Allows a user to cancel an order if it is still in the 'PENDING' state.
    Releases any active stock reservations and marks the payment as failed.
    """
    if request.method == 'POST':
        order = get_object_or_404(Order, id=order_id, user=request.user)
        if order.status == 'PENDING':
            order.status = 'CANCELLED'
            order.save()
            
            # Clear reservations
            for reservation in order.reservations.all():
                reservation.is_active = False
                reservation.save()
            
            # Update payment status if exists
            if hasattr(order, 'payment'):
                order.payment.status = 'FAILED'
                order.payment.save()
                
            messages.success(request, f'سفارش #{order.id} با موفقیت لغو شد.')
        else:
            messages.error(request, 'این سفارش قابل لغو نیست.')
            
    return redirect('orders:history')

@login_required
def order_tracking(request, order_id):
    """
    Displays the current status and tracking details for a specific order.
    """
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return render(request, 'orders/tracking.html', {'order': order})
