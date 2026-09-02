from django.utils import timezone
from apps.users.models import User
from apps.catalog.models import Product, Category
from apps.inventory.models import Inventory
from apps.promotions.models import Promotion
from apps.orders.models import Order, OrderItem
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate

def dashboard_callback(request, context):
    today = timezone.now().date()
    thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
    
    # KPIs calculation
    today_sales = Order.objects.filter(status='PAID', created_at__date=today).aggregate(total=Sum('total_amount'))['total'] or 0
    monthly_sales = Order.objects.filter(status='PAID', created_at__gte=thirty_days_ago).aggregate(total=Sum('total_amount'))['total'] or 0

    # 1. KPIs
    context['kpi'] = [
        {
            "title": "فروش امروز",
            "metric": f"{int(today_sales):,} تومان",
            "footer": "درآمد کل امروز",
        },
        {
            "title": "فروش ۳۰ روز اخیر",
            "metric": f"{int(monthly_sales):,} تومان",
            "footer": "مجموع درآمد ۳۰ روز گذشته",
        },
        {
            "title": "محصولات فعال",
            "metric": Product.objects.filter(is_active=True).count(),
            "footer": "آماده برای فروش",
        },
        {
            "title": "هشدار موجودی",
            "metric": Inventory.objects.filter(quantity__lt=5).count(),
            "footer": "محصولات با موجودی زیر ۵ عدد",
        },
    ]

    # 2. Charts Data
    # Sales Growth (last 30 days)
    sales_growth = Order.objects.filter(status='PAID', created_at__gte=thirty_days_ago) \
        .annotate(date=TruncDate('created_at')) \
        .values('date') \
        .annotate(total=Sum('total_amount')) \
        .order_by('date')

    dates = [item['date'].strftime('%Y-%m-%d') for item in sales_growth]
    sales = [float(item['total']) for item in sales_growth]

    # Products by Category
    categories = Category.objects.annotate(product_count=Count('products')).filter(product_count__gt=0)
    category_names = [c.name for c in categories]
    category_counts = [c.product_count for c in categories]

    context['charts'] = {
        'sales_chart': {
            'labels': dates,
            'data': sales,
        },
        'categories_chart': {
            'labels': category_names,
            'data': category_counts,
        }
    }

    # 3. Quick Lists
    # Top Selling Products
    context['top_products'] = OrderItem.objects.filter(order__status='PAID') \
        .values('variant__product__name', 'variant__sku') \
        .annotate(total_sold=Sum('quantity')) \
        .order_by('-total_sold')[:5]

    # Low Stock Items
    context['low_stock_items'] = Inventory.objects.filter(quantity__lt=5).order_by('quantity')[:5]

    return context
