# Build Minimal E-Commerce Modular Monolith

This plan outlines the steps to build a production-ready, modular monolith e-commerce platform using Django and PostgreSQL, strictly adhering to the `ARCHITECTURE.md` specification.

## User Review Required

> [!IMPORTANT]
> The database is specified as PostgreSQL. The initial setup assumes you have a PostgreSQL server running locally or accessible via URL. To proceed, I will use SQLite initially for the project generation and schema validation *unless* you have a PostgreSQL instance ready, in which case we will configure `.env` with a `DATABASE_URL`. Please let me know if you want to use SQLite for development right now or if I should strict-enforce PostgreSQL from the start (which will require you to provide DB credentials or run a local Postgres instance).
>
> The plan includes generating the full project. If approved, I will begin by generating the environment, project structure, and all models.

## Open Questions

> [!WARNING]
> Do you have a running PostgreSQL database for me to connect to, or should I configure a standard local Postgres connection (`dbname=shop`, `user=postgres`, etc.) and expect you to set it up? Alternatively, I can generate a `docker-compose.yml` to easily spin up a Postgres instance for this project.

## Proposed Changes

The platform will be structured as a single Django project (`shop`) containing multiple independent apps for each business domain.

### Environment & Project Structure
- [NEW] `requirements.txt`: Include Django 5.x, psycopg2-binary, django-environ, django-htmx.
- [NEW] `README.md`: Instructions for setup.
- [NEW] `shop/manage.py` and `shop/config/`: Main Django project configuration.
- [NEW] `shop/common/`: Shared utilities (mixins, base models).
- [NEW] `shop/templates/`: Base templates including HTMX and Alpine.js via CDN.

### 1. Users App (`apps/users`)
- [NEW] `User` model: Extending `AbstractUser`.
- [NEW] `Address` model: For user shipping/billing addresses.

### 2. Catalog App (`apps/catalog`)
- [NEW] `Category`, `Brand`, `Product` models.
- [NEW] `Variant` (SKU) model: Linked to Product (one-to-many), holding price and specific attributes (e.g., size, color).

### 3. Inventory App (`apps/inventory`)
- [NEW] `Inventory` model: 1-to-1 or foreign key to `Variant`, tracking stock levels.
- [NEW] `StockReservation` model: To lock stock temporarily during checkout.

### 4. Cart App (`apps/cart`)
- [NEW] `Cart` model: Session-based or User-linked.
- [NEW] `CartItem` model: Linked to `Variant` and `Cart`, tracking quantity.

### 5. Orders App (`apps/orders`)
- [NEW] `Order` model: Tracking total, status, and linked user/address.
- [NEW] `OrderItem` model: Snapshot of the variant details at the time of purchase.

### 6. Payments App (`apps/payments`)
- [NEW] `Payment` model: Tracking payment intent, status, and provider response.

### 7. Promotions App (`apps/promotions`)
- [NEW] `Promotion` model: Discount codes and logic.

### 8. Core Features & Business Logic
- **Checkout Flow**: Implemented as a service/view that orchestrates Cart -> Stock Reservation (with `select_for_update`) -> Payment initiation -> Order Confirmation.
- **Search**: PostgreSQL Full-Text Search integration in the catalog views.
- **Admin**: Standard Django Admin registered for all models.

## Verification Plan

### Automated Tests
- Basic unit tests in `apps/inventory/tests.py` and `apps/orders/tests.py` to ensure stock reservations use transactions and lock rows correctly (preventing overselling).

### Manual Verification
- Run `python manage.py check` and `python manage.py makemigrations`.
- Provide instructions for the user to migrate the database and access the Django Admin panel.
- Demonstrate adding an item to the cart and walking through the checkout stock-reservation process.
