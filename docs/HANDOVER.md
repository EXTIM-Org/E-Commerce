# Project Handover & Context Summary

This document serves as a comprehensive summary of the E-Commerce project for onboarding a new AI Agent to continue development.

## 🛠 Tech Stack & Environment
- **Framework**: Next.js 16.3.5 (App Router)
- **Database ORM**: **Prisma 8 (Contract-First ORM)** (This is highly critical! See Prisma 8 Caveats below)
- **Database Provider**: PostgreSQL (via `@internal/postgres/runtime`)
- **Styling**: Tailwind CSS + Lucide React icons
- **State Management**: React Context (`CartContext.tsx`)
- **Validation**: Zod (Server Actions)

## 📦 Features Implemented & Current State

### 1. Database Schema (`src/prisma/contract.prisma`)
The core schema is fully designed and pushed to the database. It includes:
- `User`, `Address`, `Wishlist`, `WishlistItem`
- `Product`, `Category`, `ProductVariant`, `Inventory`, `InventoryTransaction`
- `Cart`, `CartItem`, `Order`, `OrderItem`, `Review`

### 2. User Authentication & Profile (Partial)
- Basic login/registration logic exists.
- Profile layouts and sidebar navigation implemented (`src/app/profile/layout.tsx`).
- User can add and delete multiple shipping addresses (`src/actions/address.ts`).
- **Wishlist System**: Users can add/remove products to their wishlist. The UI syncs seamlessly, and the backend utilizes Prisma 8 `.where().delete()` and relational `.include()`.

### 3. Shopping Cart & Checkout
- **Cart Context**: Client-side state management for cart items, quantities, and real-time total calculations (`src/store/CartContext.tsx`).
- **Checkout Flow**: Validates shipping details, calculates shipping costs, creates an `Order`, generates `OrderItem`s, deducts from `Inventory`, and records an `InventoryTransaction`.
- *Note:* The checkout loop bug (where `clearCart` dependency triggered infinite renders) was successfully fixed.

### 4. Advanced Search & Filtering (Server-Side)
- Located in `src/app/products/page.tsx` and `src/components/product/ProductFilters.tsx`.
- **UI**: A sticky sidebar with debounced search input, category dropdown, min/max price fields, and sorting dropdown.
- **Logic**: Filters are synced with URL `searchParams`. The server parses these params and dynamically chains Prisma 8 `.where()` clauses (`.ilike`, `.gte`, `.lte`, `.eq`) and `.orderBy()` to fetch results efficiently.

### 5. Smart Recommender System (`src/lib/recommender.ts`)
- Tracks `viewCount` and `salesCount` (incremented async on product page load).
- **Popular Products**: Fetches products ordered by sales/views.
- **Similar Products**: Products in the same category excluding the current one.
- **Frequently Bought Together (Collaborative Filtering)**: Finds orders containing the current product's variants, then finds other products in those exact same orders.

---

## ⚠️ CRITICAL: Prisma 8 (Contract-First) Syntax Rules
This project uses **Prisma 8**, which has breaking syntax changes compared to older Prisma versions. The previous agent encountered and resolved several errors by learning these rules:

1. **`.where()` requires Lambdas or Object Shorthand**:
   - Correct: `.where((p) => p.categoryId.eq(catId)).where((p) => p.basePrice.gte(minPrice))`
   - **DO NOT** use string operators. Use `.eq()`, `.neq()`, `.ilike()`, `.in([...])`, `.gte()`.
   - **No `.between()`**: You must chain two `.where()` calls.
2. **`.orderBy()` requires Lambdas**:
   - Correct: `.orderBy((p) => p.salesCount.desc())`
   - Correct (multiple): `.orderBy([(p) => p.salesCount.desc(), (p) => p.viewCount.desc()])`
3. **`.include()` for Relations**:
   - Must use callbacks for nested includes.
   - Correct: `.include("items", (items) => items.include("product"))`
4. **Data fetching termination**:
   - Queries return an `AsyncIterable`. You must append `.all()` or `.all().first()` to consume them.
   - Correct: `await db.orm.public.Product.all()`
5. **Relational Data Mapping**:
   - Remember that `OrderItem` links to `ProductVariant` (`variantId`), NOT `Product` (`productId`).

---

## 🚀 Next Steps (Action Items for New Agent)

The following features were discussed as the next logical steps for development:
1. **Admin Dashboard (`/admin`)**: Create a comprehensive panel for the store owner to add/edit products, manage categories, track inventory, and view incoming orders.
2. **User Dashboard Completion**: Enhance the user's order history page to show detailed invoice breakdowns and shipping statuses.
3. **Product Reviews & Ratings**: Implement the frontend UI and backend server actions to allow verified buyers to leave reviews (`Review` model).
4. **Theming**: Implement a robust Dark/Light mode toggle utilizing Tailwind CSS.

*The codebase is perfectly clean, type-checked (0 errors), and the latest code is pushed to the `main` branch on GitHub.*
