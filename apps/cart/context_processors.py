from .models import Cart

def cart_processor(request):
    """
    Context processor to make the total count of items in the user's cart 
    available across all templates globally (e.g., for the navbar cart badge).
    """
    cart_item_count = 0
    if request.user.is_authenticated:
        cart = Cart.objects.filter(user=request.user).first()
        if cart:
            cart_item_count = sum(item.quantity for item in cart.items.all())
    else:
        if request.session.session_key:
            cart = Cart.objects.filter(session_id=request.session.session_key).first()
            if cart:
                cart_item_count = sum(item.quantity for item in cart.items.all())
    return {'cart_item_count': cart_item_count}
