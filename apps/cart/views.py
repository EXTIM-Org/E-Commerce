from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from apps.catalog.models import Variant
from .models import Cart, CartItem

from django.contrib import messages

def get_or_create_cart(request):
    """
    Helper function to retrieve the existing cart for the user or session, 
    or create a new one if it doesn't exist.
    Associates the cart with the user if authenticated, otherwise uses the session key.
    """
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart
    else:
        if not request.session.session_key:
            request.session.create()
        cart, _ = Cart.objects.get_or_create(session_id=request.session.session_key, user=None)
        return cart

def cart_detail(request):
    """
    View to display the cart details.
    Can render either the full cart page or the HTMX side cart drawer based on GET parameters.
    """
    cart = get_or_create_cart(request)
    if request.GET.get('side_cart'):
        return render(request, 'cart/side_cart.html', {'cart': cart})
    return render(request, 'cart/detail.html', {'cart': cart})

def add_to_cart(request):
    """
    View to handle adding a product variant to the cart.
    Validates inventory limits and updates the cart item quantity.
    Supports HTMX requests for dynamic UI updates without full page reloads.
    """
    success_add = False
    if request.method == 'POST':
        variant_sku = request.POST.get('variant')
        if variant_sku:
            variant = get_object_or_404(Variant, sku=variant_sku, is_active=True)
            cart = get_or_create_cart(request)
            
            # Check inventory
            available_qty = variant.available_quantity
                
            cart_item_qty = 0
            existing_item = CartItem.objects.filter(cart=cart, variant=variant).first()
            if existing_item:
                cart_item_qty = existing_item.quantity
                
            if cart_item_qty + 1 > available_qty:
                messages.error(request, f'موجودی محصول "{variant.product.name}" به اتمام رسیده است یا سقف خرید مجاز رد شده است.')
            else:
                cart_item, created = CartItem.objects.get_or_create(cart=cart, variant=variant)
                if not created:
                    cart_item.quantity += 1
                    cart_item.save()
                messages.success(request, f'محصول "{variant.product.name}" به سبد خرید اضافه شد.')
                success_add = True
        else:
            messages.error(request, 'لطفاً یک گزینه معتبر را برای خرید انتخاب کنید.')
    
    if request.headers.get('HX-Request'):
        import json
        messages_list = []
        for message in messages.get_messages(request):
            messages_list.append({
                'text': message.message,
                'tags': message.tags,
            })
            
        cart = get_or_create_cart(request)
        context = {
            'cart': cart,
        }
        response = render(request, 'cart/side_cart.html', context)
        
        trigger_dict = {
            'update-cart-count': {'count': sum(item.quantity for item in cart.items.all())},
        }
        if messages_list:
            trigger_dict['show-toast'] = {'messages': messages_list}
            
        if success_add:
            trigger_dict['open-cart'] = True
            
        response['HX-Trigger'] = json.dumps(trigger_dict)
        return response
        
    next_url = request.META.get('HTTP_REFERER')
    if next_url:
        return redirect(next_url)
    return redirect('catalog:home')

def remove_from_cart(request, item_id):
    """
    View to remove a specific CartItem from the user's cart.
    Supports HTMX requests for dynamic UI updates without full page reloads.
    """
    if request.method == 'POST':
        cart = get_or_create_cart(request)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()
        messages.success(request, 'محصول از سبد خرید حذف شد.')
        
    if request.headers.get('HX-Request'):
        import json
        messages_list = []
        for message in messages.get_messages(request):
            messages_list.append({
                'text': message.message,
                'tags': message.tags,
            })
            
        cart = get_or_create_cart(request)
        context = {
            'cart': cart,
        }
        response = render(request, 'cart/side_cart.html', context)
        
        trigger_dict = {
            'update-cart-count': {'count': sum(item.quantity for item in cart.items.all())},
        }
        if messages_list:
            trigger_dict['show-toast'] = {'messages': messages_list}
            
        response['HX-Trigger'] = json.dumps(trigger_dict)
        return response
        
    return redirect('cart:detail')

def apply_coupon(request):
    """
    View to apply or remove a promotion (discount code) from the cart.
    Validates the code against active promotions and minimum cart value rules.
    """
    if request.method == 'POST':
        code = request.POST.get('coupon_code')
        cart = get_or_create_cart(request)
        if not code:
            cart.promotion = None
            cart.save()
            messages.success(request, 'کد تخفیف حذف شد.')
        else:
            from apps.promotions.models import Promotion
            try:
                promotion = Promotion.objects.get(code__iexact=code)
                subtotal = cart.get_subtotal()
                if promotion.is_valid(subtotal):
                    cart.promotion = promotion
                    cart.save()
                    messages.success(request, f'کد تخفیف "{code}" با موفقیت اعمال شد.')
                else:
                    messages.error(request, 'کد تخفیف نامعتبر است یا شرایط استفاده را ندارد.')
            except Promotion.DoesNotExist:
                messages.error(request, 'کد تخفیف یافت نشد.')
    return redirect('cart:detail')
