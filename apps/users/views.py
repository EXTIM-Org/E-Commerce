from django.shortcuts import render, redirect
from django.contrib.auth import login as auth_login
from django.contrib import messages
from apps.cart.models import Cart, CartItem
from .forms import CustomUserCreationForm, CustomAuthForm

def merge_cart(request, user):
    """
    Merges the anonymous session cart with the user's authenticated cart.
    This ensures items added before login are preserved after login.
    """
    session_key = request.session.session_key
    if not session_key:
        return
    try:
        session_cart = Cart.objects.get(session_id=session_key, user=None)
        user_cart, _ = Cart.objects.get_or_create(user=user)
        for item in session_cart.items.all():
            user_item, created = CartItem.objects.get_or_create(cart=user_cart, variant=item.variant)
            if not created:
                user_item.quantity += item.quantity
                user_item.save()
            else:
                user_item.quantity = item.quantity
                user_item.save()
        session_cart.delete()
    except Cart.DoesNotExist:
        pass

def auth_view(request):
    """
    Handles both login and signup functionality in a single view with tabs.
    On successful login/signup, merges the session cart and redirects to home.
    """
    # Default to login tab unless "signup" is in path or query param
    default_tab = 'signup' if 'signup' in request.path else 'login'
    active_tab = request.GET.get('tab', default_tab)
    
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'login':
            login_form = CustomAuthForm(request, data=request.POST)
            signup_form = CustomUserCreationForm()
            if login_form.is_valid():
                user = login_form.get_user()
                auth_login(request, user)
                
                # Handle Remember Me
                if request.POST.get('remember_me'):
                    request.session.set_expiry(1209600)  # 2 weeks in seconds
                else:
                    request.session.set_expiry(0)  # Expires when browser closes
                    
                merge_cart(request, user)
                messages.success(request, 'با موفقیت وارد شدید.')
                return redirect('catalog:home')
            else:
                active_tab = 'login'
                messages.error(request, 'ایمیل یا رمز عبور اشتباه است.')
        elif action == 'signup':
            login_form = CustomAuthForm()
            signup_form = CustomUserCreationForm(request.POST)
            if signup_form.is_valid():
                user = signup_form.save()
                auth_login(request, user)
                merge_cart(request, user)
                messages.success(request, 'ثبت‌نام شما با موفقیت انجام شد! خوش آمدید.')
                return redirect('catalog:home')
            else:
                active_tab = 'signup'
                messages.error(request, 'ثبت‌نام انجام نشد. لطفاً خطاهای زیر را برطرف کنید.')
    else:
        login_form = CustomAuthForm()
        signup_form = CustomUserCreationForm()

    return render(request, 'users/auth.html', {
        'login_form': login_form,
        'signup_form': signup_form,
        'active_tab': active_tab
    })

from django.contrib.auth.decorators import login_required
from .models import Address

@login_required
def profile_dashboard(request):
    """
    Displays and handles updates to the user's personal profile information,
    including name, phone number, and avatar image.
    """
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        phone = request.POST.get('phone_number')
        avatar = request.FILES.get('avatar')
        
        from django.core.exceptions import ValidationError
        try:
            request.user.first_name = first_name
            request.user.last_name = last_name
            request.user.phone_number = phone
            
            if avatar:
                request.user.avatar = avatar
                
            request.user.save()
            messages.success(request, 'اطلاعات پروفایل با موفقیت بروزرسانی شد.')
        except ValidationError as e:
            for field, errors in e.message_dict.items():
                for error in errors:
                    messages.error(request, f"{error}")
                    
        return redirect('users:profile')
        
    return render(request, 'users/profile.html', {
        'user': request.user
    })

@login_required
def manage_addresses(request):
    """
    Displays the user's saved addresses and handles the creation of new addresses.
    """
    if request.method == 'POST':
        street = request.POST.get('street')
        city = request.POST.get('city')
        state = request.POST.get('state')
        postal_code = request.POST.get('postal_code')
        
        from django.core.exceptions import ValidationError
        if street and city and state:
            try:
                Address.objects.create(
                    user=request.user,
                    street=street,
                    city=city,
                    state=state,
                    postal_code=postal_code,
                    country='Iran'
                )
                messages.success(request, 'آدرس جدید با موفقیت اضافه شد.')
            except ValidationError as e:
                for field, errors in e.message_dict.items():
                    for error in errors:
                        messages.error(request, f"{error}")
        else:
            messages.error(request, 'لطفا فیلدهای ضروری را پر کنید.')
        return redirect('users:addresses')
        
    addresses = request.user.addresses.all()
    return render(request, 'users/addresses.html', {
        'addresses': addresses
    })

@login_required
def delete_address(request, address_id):
    """
    Deletes a specific address belonging to the current user.
    """
    if request.method == 'POST':
        try:
            address = Address.objects.get(id=address_id, user=request.user)
            address.delete()
            messages.success(request, 'آدرس با موفقیت حذف شد.')
        except Address.DoesNotExist:
            messages.error(request, 'آدرس یافت نشد.')
    return redirect('users:addresses')
