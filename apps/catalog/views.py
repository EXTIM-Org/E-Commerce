from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.core.cache import cache
from django.contrib.postgres.search import SearchVector, SearchQuery
from django.db.models import Q
from .models import Product, Category
from .forms import ReviewForm
from apps.orders.models import OrderItem
from .models import Review
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

def home(request):
    """
    Renders the homepage of the eCommerce site.
    Utilizes Django's caching framework to store complex queries (products, categories, banners) 
    in Redis, reducing database load. The cache timeout is dynamically loaded from SiteSetting.
    """
    from apps.promotions.models import HeroBanner
    from .models import SiteSetting
    
    timeout_seconds = SiteSetting.load().home_cache_timeout * 60
    
    products = cache.get('home_products')
    if products is None:
        products = list(Product.objects.filter(is_active=True).select_related('category', 'brand').prefetch_related('variants', 'variants__inventory')[:10])
        cache.set('home_products', products, timeout_seconds)
        
    categories = cache.get('home_categories')
    if categories is None:
        categories = list(Category.objects.all())
        cache.set('home_categories', categories, timeout_seconds)
        
    banner = cache.get('home_banner')
    if banner is None:
        banner = HeroBanner.objects.filter(is_active=True).first()
        cache.set('home_banner', banner, timeout_seconds)
        
    return render(request, 'catalog/home.html', {'products': products, 'categories': categories, 'banner': banner})

def search_products(request):
    """
    Handles product search functionality, filtering by keywords, categories, and price ranges.
    Supports both standard `icontains` filtering and PostgreSQL Full-Text Search (FTS).
    """
    query = request.GET.get('q', '')
    use_fts = request.GET.get('advanced', 'false') == 'true'
    
    products = Product.objects.filter(is_active=True).select_related('category', 'brand').prefetch_related('variants', 'variants__inventory', 'images')
    
    if query:
        if use_fts:
            # Advanced method with Full-Text Search
            products = products.annotate(
                search=SearchVector('name', 'description')
            ).filter(search=SearchQuery(query))
        else:
            # Simple method
            products = products.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query)
            )
            
    # Filtering
    if category := request.GET.get('category'):
        products = products.filter(category__slug=category)
    
    if min_price := request.GET.get('min_price'):
        products = products.filter(variants__price__gte=min_price)
    
    if max_price := request.GET.get('max_price'):
        products = products.filter(variants__price__lte=max_price)
        
    products = products.distinct()
    categories = Category.objects.all()
    
    return render(request, 'catalog/search_results.html', {
        'products': products,
        'query': query,
        'categories': categories,
        'active_category': request.GET.get('category', '')
    })

def product_detail(request, slug):
    """
    Renders the detailed view of a single product based on its slug.
    Also handles the submission of user reviews (both top-level and replies).
    """
    product = get_object_or_404(Product.objects.select_related('category', 'brand').prefetch_related('variants', 'variants__inventory', 'images'), slug=slug, is_active=True)
    reviews = product.reviews.filter(is_approved=True)
    
    is_verified_buyer = False
    if request.user.is_authenticated:
        is_verified_buyer = OrderItem.objects.filter(
            order__user=request.user,
            order__status='DELIVERED',
            variant__product=product
        ).exists()

    # Get only top-level reviews
    reviews = product.reviews.filter(is_approved=True, parent__isnull=True)
    
    user_previous_review = None
    if request.user.is_authenticated:
        user_previous_review = Review.objects.filter(
            product=product,
            user=request.user,
            parent__isnull=True,
            rating__isnull=False
        ).first()

    if request.method == 'POST':
        if not request.user.is_authenticated:
            messages.error(request, 'برای ثبت نظر باید وارد سایت شوید.')
            return redirect('users:login')
            
        form = ReviewForm(request.POST)
        if form.is_valid():
            review = form.save(commit=False)
            review.product = product
            review.user = request.user
            
            parent_id = request.POST.get('parent_id')
            if parent_id:
                try:
                    parent_review = Review.objects.get(id=parent_id, product=product)
                    review.parent = parent_review
                    # Auto-approve replies for admins, otherwise require approval (or follow same logic)
                    if request.user.is_staff or request.user.is_superuser:
                        review.is_approved = True
                except Review.DoesNotExist:
                    pass
            else:
                # Top-level review: ensure user can only rate once
                if user_previous_review:
                    review.rating = None
                    review.recommend = None
            
            review.save()
            messages.success(request, 'نظر شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد.')
            return redirect('catalog:product_detail', slug=product.slug)
    else:
        form = ReviewForm()

    return render(request, 'catalog/product_detail.html', {
        'product': product,
        'reviews': reviews,
        'form': form,
        'is_verified_buyer': is_verified_buyer,
        'user_previous_review': user_previous_review
    })

@login_required
def like_review(request, review_id):
    """
    AJAX endpoint for toggling a 'like' on a specific review.
    Ensures mutual exclusivity between likes and dislikes.
    """
    if request.method == 'POST':
        review = get_object_or_404(Review, id=review_id)
        if request.user in review.likes.all():
            review.likes.remove(request.user)
            liked = False
        else:
            review.likes.add(request.user)
            review.dislikes.remove(request.user)
            liked = True
        
        return JsonResponse({
            'liked': liked,
            'likes_count': review.likes.count(),
            'dislikes_count': review.dislikes.count()
        })
    return JsonResponse({'error': 'Invalid request'}, status=400)

@login_required
def dislike_review(request, review_id):
    """
    AJAX endpoint for toggling a 'dislike' on a specific review.
    Ensures mutual exclusivity between likes and dislikes.
    """
    if request.method == 'POST':
        review = get_object_or_404(Review, id=review_id)
        if request.user in review.dislikes.all():
            review.dislikes.remove(request.user)
            disliked = False
        else:
            review.dislikes.add(request.user)
            review.likes.remove(request.user)
            disliked = True
            
        return JsonResponse({
            'disliked': disliked,
            'likes_count': review.likes.count(),
            'dislikes_count': review.dislikes.count()
        })
    return JsonResponse({'error': 'Invalid request'}, status=400)
