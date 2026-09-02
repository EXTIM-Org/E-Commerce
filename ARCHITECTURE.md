# E-Commerce Architecture - Minimal Version

## 1. Overview

A pragmatic **Django Modular Monolith** for an e-commerce platform.

Initial architecture:

Django + PostgreSQL

The expected traffic is moderate for the first several years, so the system intentionally avoids premature adoption of microservices, Kafka, Redis, Celery, Kubernetes, and other distributed infrastructure.

PostgreSQL is the transactional source of truth for all data.

---

## 2. Architectural Principles

- Modular Monolith: Business domains are separated into Django apps while remaining one deployable application.
- PostgreSQL as Source of Truth: Product, inventory, orders, payments, users, and other transactional data live here.
- Synchronous by Default: Normal business flows run directly through Django.
- Minimal Infrastructure: No Redis, Celery, Kafka, Kubernetes, API Gateway, or microservices initially.
- Evolution Over Prediction: Add infrastructure only when real requirements justify it.

---

## 3. High-Level Architecture

Browser -> Django -> PostgreSQL

All requests go from the browser to Django, and Django communicates with PostgreSQL.

---

## 4. Core Django Structure

shop/
├── config/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── users/          # Accounts, authentication, profiles
│   ├── catalog/        # Products, categories, brands
│   ├── inventory/      # Stock levels and inventory
│   ├── cart/           # Shopping cart
│   ├── orders/         # Orders and order lifecycle
│   ├── payments/       # Payment processing
│   └── promotions/     # Discounts and promotional rules
├── common/             # Shared utilities
├── templates/          # HTML templates
├── static/             # Static files
├── media/              # Product images
└── manage.py

These are application boundaries, not independent microservices.

### Users

- Accounts
- Authentication
- Profiles
- Roles and permissions
- Addresses
- Admin access

### Catalog

- Products
- Categories
- Brands
- Attributes
- Media
- Variants / SKUs
- Product status
- Pricing data

Inventory should operate at SKU/Variant level:

T-Shirt
├── RED-M
├── RED-L
├── BLUE-M
└── BLUE-L

### Inventory

- Stock levels
- SKU availability
- Stock reservations
- Stock confirmation/release
- Inventory adjustments

PostgreSQL is authoritative for inventory.

Recommended checkout flow:

Checkout -> Reserve Stock -> Payment -> Confirm Reservation -> Order Confirmed

If payment fails, release the reservation.

### Cart

- Cart
- Cart items
- Quantity changes
- Cart expiration where required
- Checkout preparation

### Orders

- Checkout completion
- Order creation
- Order lifecycle
- Order items
- Customer order history
- Purchase-time totals/snapshots

Orders should preserve the relevant purchase-time price, quantity, product/SKU, discounts, and other historical values.

### Payments

- Payment initiation
- Payment status
- Provider integration
- Confirmation
- Refunds
- Failed payments
- Provider callbacks/webhooks

Payment status should not depend only on a frontend redirect; provider callbacks/webhooks should be handled by Django.

### Promotions

- Discount codes
- Promotional rules
- Campaigns
- Product/category discounts
- Validation

---

## 5. Frontend

### Option A — Django Templates + HTMX/Alpine.js

Recommended for a simple, SEO-friendly storefront with minimal complexity:

Browser -> Django Templates -> Django -> PostgreSQL

### Option B — Next.js

Use a separate frontend only if the product actually requires highly interactive UI, independent frontend deployment, or multiple API consumers:

Next.js -> Django API -> PostgreSQL

---

## 6. Search

Search is handled directly using **PostgreSQL built-in capabilities**.

### Simple Search with SQL

SELECT * FROM catalog_product 
WHERE name ILIKE '%keyword%' 
   OR description ILIKE '%keyword%';

### Advanced Search with PostgreSQL Full-Text Search

SELECT * FROM catalog_product 
WHERE to_tsvector('english', name || ' ' || description) 
   @@ to_tsquery('english', 'keyword');

### Django Implementation

from django.contrib.postgres.search import SearchVector, SearchQuery
from django.db.models import Q

def search_products(query):
    # Simple method
    results = Product.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query)
    )
    
    # Advanced method with Full-Text Search
    # results = Product.objects.annotate(
    #     search=SearchVector('name', 'description')
    # ).filter(search=SearchQuery(query))
    
    return results

### Advanced Filtering

Use Django QuerySet for filtering by price, category, attributes, etc.:

def filter_products(request):
    queryset = Product.objects.filter(is_active=True)
    
    if category := request.GET.get('category'):
        queryset = queryset.filter(category__slug=category)
    
    if min_price := request.GET.get('min_price'):
        queryset = queryset.filter(variants__price__gte=min_price)
    
    if max_price := request.GET.get('max_price'):
        queryset = queryset.filter(variants__price__lte=max_price)
    
    return queryset.distinct()

### Advantages

- No separate service: No need for Elasticsearch, Algolia, or any external service
- Simplicity: Search is part of the database
- Lower cost: One PostgreSQL instance is sufficient
- Security: SQL Injection protection via Django ORM

### Limitations

- May become slow with large datasets (over 100,000 products)
- Complex ranking capabilities are limited
- Full Persian language support requires configuration

If you hit these limitations, you can migrate to external search later.

---

## 7. Data Model & Consistency

Main Django models:

User
Product
Variant / SKU
Category
Inventory
StockReservation
Cart
CartItem
Order
OrderItem
Payment
Promotion

Checkout, stock reservation, and order operations should use PostgreSQL transactions and appropriate constraints/locking:

Checkout -> Validate Cart -> Reserve Stock (transaction) -> Create Payment -> Confirm Payment -> Confirm/Create Order

---

## 8. Admin Panel

Use **Django Admin** initially.

It should cover:

- Products
- Categories
- SKUs/Variants
- Inventory
- Orders
- Users
- Promotions
- Payment status

Build a custom admin UI only when real workflows require it.

---

## 9. Security

- HTTPS/TLS
- Django authentication and authorization
- CSRF protection
- Secure cookies
- Input validation
- ORM parameterization (SQL Injection protection)
- Rate limiting where necessary
- Strong admin permissions
- Secure secret management
- Payment webhook verification

---

## 10. Deployment

Keep initial deployment simple:

Internet -> CDN / WAF -> Nginx -> Django -> PostgreSQL

Docker is optional but useful for reproducible deployments.

Kubernetes is not required.

When traffic grows:

CDN / WAF -> Load Balancer -> Django, Django, Django -> PostgreSQL

Scale PostgreSQL only when measurements show a need.

---

## 11. Observability & Reliability

Initial recommendations:

- Application error tracking
- Structured logs
- Basic server metrics
- Database monitoring
- Health checks
- Backup monitoring

Use a service like Sentry for error tracking.

### Backups

PostgreSQL backups are critical:

- Automated backups
- Retention policy
- Periodic restore testing
- Off-site storage

---

## 12. Scaling Strategy

### Stage 1 — Initial

Django
PostgreSQL

### Stage 2 — Moderate Growth

CDN / WAF
Multiple Django instances
PostgreSQL

### Stage 3 — Actual Bottleneck

Introduce only what solves a measured problem:

- Redis for caching/shared state
- Celery for background jobs
- Read replicas for database read scaling
- A dedicated service only when a specific domain genuinely requires extraction

Microservices should be introduced based on measured requirements, not anticipated traffic.

---

## 13. Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Django |
| API | Django REST Framework when needed |
| Frontend | Django Templates + HTMX/Alpine.js OR Next.js |
| Database | PostgreSQL |
| Search | PostgreSQL Full-Text Search |
| Admin | Django Admin |
| Web Server | Nginx or managed equivalent |
| CDN/WAF | CDN/WAF provider |
| Containerization | Docker, optional |
| Cache | None initially |
| Background Jobs | None initially |
| Message Broker | None |
| Orchestration | None initially |
| Monitoring | Sentry + basic metrics |

---

## 14. Implementation Roadmap

### Phase 1 — MVP

- Set up Django
- Create modular Django apps
- Set up PostgreSQL
- Users/Auth
- Catalog
- Product + SKU/Variant models
- Django Admin
- Storefront
- Inventory
- Cart
- Orders

### Phase 2 — Commerce

- Payment provider
- Payment webhooks/callbacks
- Stock reservations
- Promotions
- Production security
- Automated PostgreSQL backups

### Phase 3 — Search & Performance

- Configure PostgreSQL Full-Text Search
- Optimize PostgreSQL queries
- CDN/WAF
- Add appropriate HTTP/application caching

### Phase 4 — Growth

Only when actual requirements justify it:

- Multiple Django instances
- Load balancing
- Redis
- Celery
- PostgreSQL scaling
- Service extraction

---

## 15. Glossary

- Modular Monolith: One deployable application divided into clear business modules.
- Django App: A module inside the Django project, not necessarily an independent service.
- Source of Truth: The authoritative system containing canonical business data.
- SKU / Variant: A purchasable product variation with its own inventory identity.
- Stock Reservation: Temporary allocation of inventory during checkout/payment.
- Full-Text Search: PostgreSQL's built-in text search capability.
- CDN: A content delivery network for distributing static/cacheable content closer to users.