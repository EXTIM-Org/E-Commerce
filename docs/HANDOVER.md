# Project Handover & Context Summary

This document serves as a comprehensive summary of the EXTIM E-Commerce project for onboarding a new AI Agent to continue development.

## 🛠 Tech Stack & Environment
- **Framework**: Next.js 16.3.5 (App Router)
- **Database ORM**: **Prisma 8 (Contract-First ORM)** (This is highly critical! See Prisma 8 Caveats below)
- **Database Provider**: PostgreSQL (via `@prisma/orm-postgres`)
- **Styling**: Tailwind CSS + Lucide React icons
- **State Management**: React Context (`CartContext.tsx`)
- **Validation**: Zod (Server Actions)
- **Authentication**: Stateless JWT Sessions (via `jose` storing `userId`, `name`, `role`, etc., in `extim_session` cookie).

## 📦 Features Implemented & Current State

### 1. Database Schema (`prisma/schema.prisma` -> `src/prisma/contract.json`)
The core schema is fully designed, pushed to the database, and synced. It includes:
- `User`, `Address`, `Wishlist`, `WishlistItem`
- `Product`, `Category`, `ProductVariant`, `Inventory`, `InventoryTransaction`
- `Cart`, `CartItem`, `Order`, `OrderItem`, `Review` (Includes `isVerifiedBuyer` and `purchasedVariantName`)

### 2. User Authentication & Profile
- Fully functional login and registration with hashed passwords (`bcryptjs`).
- Profile layouts and sidebar navigation implemented (`src/app/profile/layout.tsx`).
- Users can update their profile name (synchronizes directly with the JWT Session Cookie).
- Users can add and delete multiple shipping addresses.
- **Wishlist System**: Add/remove products seamlessly.

### 3. Shopping Cart & Checkout
- **Cart Context**: Client-side state management for cart items, quantities, and real-time total calculations.
- **Checkout Flow**: Validates shipping details, calculates shipping costs, creates an `Order`, generates `OrderItem`s, deducts from `Inventory`, and records an `InventoryTransaction`.

### 4. Advanced Search & Filtering (Server-Side)
- **UI**: A sticky sidebar with debounced search input, category dropdown, min/max price fields, and sorting.
- **Custom Dropdowns**: All native browser `<select>` elements have been fully replaced with custom, animated, glassmorphic dropdown components that support click-outside detection and match the premium UI.
- **Logic**: Filters are synced with URL `searchParams`. The server dynamically chains Prisma 8 `.where()` clauses (`.ilike`, `.gte`, `.lte`, `.eq`) and `.orderBy()` to fetch results efficiently.

### 5. Smart Recommender System (`src/lib/recommender.ts`)
- Tracks `viewCount` and `salesCount` (incremented async on product page load).
- **Popular Products**: Fetches products ordered by sales/views.
- **Similar Products**: Products in the same category excluding the current one.
- **Frequently Bought Together**: Uses Collaborative Filtering to suggest products bought in the same orders.

### 6. Admin Dashboard (`/admin`)
- Comprehensive admin layout with restricted access middleware/logic.
- **Product Management**: Admins can create new products and upload product images.
- **Order Management**: Admins can view orders and update their status (e.g., `PENDING` -> `SHIPPED`) using a custom interactive dropdown component (`StatusUpdater`).

### 7. Product Reviews & Ratings
- Fully implemented frontend UI and backend server actions.
- Automatically detects if the reviewer is a verified buyer and what variant they purchased (`isVerifiedBuyer` and `purchasedVariantName`).

### 8. Premium Theming (Light & Dark Mode)
- **Consistent Glassmorphism**: The entire application uses a state-of-the-art modern aesthetic with `backdrop-blur` and translucent backgrounds (`bg-white/5` for dark mode, `bg-white/70` for light mode).
- **Theme Toggle**: Fully supports toggling between light and dark themes using `next-themes` without any textual or structural artifacts.

### 9. Order Tracking & Timeline
- A visual order tracking timeline (`OrderTimeline`) has been implemented to show states: PENDING, PAID, PROCESSING, SHIPPED, DELIVERED.
- **Admin**: Admins can update the status of the order and add a postal tracking code in `/admin/orders/[id]`. This triggers an automatic email notification to the user.
- **User**: Users can see the graphical timeline of their order and easily copy the tracking code in `/profile/orders/[id]`.

### 10. Advanced Admin Product Management
- Full CRUD for products with dynamic variant and inventory input fields integrated in `ProductForm.tsx`.
- **Product Filters & Sorts**: The admin product list (`/admin/products`) supports filtering by text and category, as well as sorting by Base Price, Inventory Stock, and Sales Count by clicking on the table headers.

### 11. Smart Inventory Badges (FOMO & UX)
- Avoids showing exact stock numbers to preserve perceived value and prevent competitor scraping.
- **Product Cards**: Displays a beautiful "ناموجود" overlay for out-of-stock items, and a pulsing orange "موجودی محدود" badge if stock is running low.
- **Product Details Page**: Dynamically displays semantic stock statuses ("موجود در انبار", "تنها X عدد باقی مانده!", or "ناموجود") based on the selected variant, leveraging the database's `lowStockThreshold`.

### 12. Mock Payment Gateway
- A simulated payment page allows for complete end-to-end testing of the checkout flow (Order creation -> Payment -> Inventory deduction) without requiring a real third-party provider.

### 13. Coupon & Discount System
- Fully functional discount system where admins can create coupon codes (percentage or fixed amount, with expiry and usage limits).
- Users can apply these codes during checkout to receive dynamic discounts on their cart total.

---

## ⚠️ CRITICAL: Prisma 8 (Contract-First) Syntax Rules
This project uses **Prisma 8**, which has breaking syntax changes compared to older Prisma versions. The previous agent encountered and resolved several errors by learning these rules:

1. **Schema Updates**:
   - Update `prisma/schema.prisma`.
   - Run `npm run contract:emit` to update the internal contract (`src/prisma/contract.json`).
   - Run `npx prisma db update` (or update DB directly via SQL if migrations fail).
2. **`.where()` requires Lambdas or Object Shorthand**:
   - Correct: `.where((p) => p.categoryId.eq(catId)).where((p) => p.basePrice.gte(minPrice))`
   - **DO NOT** use string operators. Use `.eq()`, `.neq()`, `.ilike()`, `.in([...])`, `.gte()`.
   - **No `.between()`**: You must chain two `.where()` calls.
3. **`.orderBy()` requires Lambdas**:
   - Correct: `.orderBy((p) => p.salesCount.desc())`
   - Correct (multiple): `.orderBy([(p) => p.salesCount.desc(), (p) => p.viewCount.desc()])`
4. **`.include()` for Relations**:
   - Must use callbacks for nested includes.
   - Correct: `.include("items", (items) => items.include("product"))`
5. **Data fetching termination**:
   - Queries return an `AsyncIterable`. You must append `.all()` or `.first()` to consume them.
   - Correct: `await db.orm.public.Product.all()`
6. **Relational Data Mapping**:
   - Remember that `OrderItem` links to `ProductVariant` (`variantId`), NOT `Product` (`productId`).
7. **Raw Queries**:
   - Use `db.sql\`...\`` to execute raw SQL queries. E.g.: `await db.sql\`ALTER TABLE ...\`;`

---

## 🚀 Next Steps (Action Items for New Agent)

The following features are the next logical steps for development:
1. **Payment Gateway Integration**: (✅ Completed) Mock payment gateway implemented for testing checkout flows.
2. **Advanced Image Uploads**: (✅ Completed) Enabled multiple image uploads per product and an image gallery viewer in the Admin panel.
3. **Email Verification / Notifications**: (✅ Completed) Provider-agnostic email system implemented using Nodemailer and React-Email.
4. **Sales Analytics / Charts**: (✅ Completed) Added Recharts-based visual charts to the Admin Dashboard showing revenue and top-selling products.
5. **Product Q&A System**: (✅ Completed) Implemented interactive Product Q&A section with Admin Dashboard management.
6. **Advanced Shop Page (Search & Filters)**: (✅ Completed) Server-side advanced search and filtering system.
7. **User Dashboard & Wishlist**: (✅ Completed) Fully integrated user profile, order tracking, and wishlist.
8. **Server-Side Cart & Inventory Reservation**: (✅ Completed) Intelligent inventory reservation for logged-in users with a 15-minute lazy-cleanup expiration and FOMO cart timers.
9. **Technical Specifications & Admin UI Enhancements**: (✅ Completed) Added `ProductSpecification` model to Prisma, allowing flexible technical specifications per product. Upgraded `ProductForm.tsx` to automatically supply optional default dimension fields (Weight, Length, Width, Height) with dynamic placeholders. Adjusted Admin UI layout to place Specifications under Variants. Polished the Product Details tabs by reorganizing their order (Reviews -> Q&A -> Specs) and updating the active Reviews tab to a premium analogous color (`rose-500`). Fixed lingering `.next` caching errors leading to 404s on admin routes.
10. **Flash Sales & UI Standardization**: (✅ Completed) Implemented time-sensitive Flash Sales with lazy evaluation pricing (no cron jobs required). Standardized all admin and user-facing `<select>` inputs to custom glassmorphic dropdowns. Fixed product card heights for consistency and integrated a "Recently Viewed Products" carousel using localStorage and server actions.
11. **Advanced SEO & Rich Snippets**: (✅ Completed) Fully integrated Google Rich Snippets via JSON-LD `@graph` on Product pages (including `Product`, `AggregateRating`, `Review`, `BreadcrumbList`, and `FAQPage`) to maximize organic search visibility and CTR.
12. **Markdown-Based Blog & CMS System**: (✅ Completed) Built a fully functional Blog for SEO optimization. Extended Prisma 8 contract with `Article` and `ArticleCategory` models. Integrated `react-markdown` and `@tailwindcss/typography` for secure and beautiful content rendering. Developed comprehensive Admin Dashboard interfaces (`/admin/blog`) for article and category management, alongside public dynamic routes (`/blog` and `/blog/[slug]`) featuring view counts and `Article` schema JSON-LD.
13. **Admin UI Refinements & Codebase Stabilization**: (✅ Completed) Resolved clipping issues in the Admin Order Status dropdown by migrating to React Portals (`createPortal`) with dynamic color-coding and scroll event handling. Executed a project-wide cleanup achieving zero TypeScript compilation errors and zero ESLint warnings, standardizing `catch` blocks in Server Actions and fixing authentication action bugs.
14. **Customer Support System & Static Pages**: (✅ Completed) Implemented the `SUPPORT` user role with restricted admin access to the Contact Messages dashboard and Blog management. Built high-end glassmorphic static pages (About Us, Privacy Policy, Terms, etc.) and a dynamic Footer component. Ensured strict security by limiting message deletion to `SUPER_ADMIN` only. Resolved all React hook exhaustive-deps warnings and unused imports.
15. **Dynamic Category Management**: (✅ Completed) Refactored the Category model in Prisma to support custom `image`, `iconName`, and `colorGradient`. Implemented image uploads utilizing `sharp` for WebP compression. Upgraded the public categories page (`/categories`) to seamlessly render custom images or fallback to dynamic Lucide icons within a premium glassmorphic layout. Automated unused image cleanup on category edits and deletions. Conducted full ESLint and TypeScript compilation pass for 100% codebase health.
16. **Advanced Ticketing Workflows**: (✅ Completed) Implemented dynamic ticket status transitions (auto-SEEN on admin open, auto-WAITING_FOR_USER on admin reply). Added client-side intelligent sorting to the Admin Tickets list (mapping statuses and priorities to numerical weights, keeping CLOSED tickets at the bottom). Added a client-side pagination system (10/page) with standard LTR navigation to both Admin and User Ticket pages.
18. **Admin Order Visibility**: (✅ Completed) Linked support tickets directly to their respective `Order` details within the Admin interface. Made the hidden `/admin/orders/[id]` page accessible by adding a "View Details" button to each order card in the master Admin Orders list.
19. **Security & Rate Limiting**: (✅ Completed) Implemented a distributed Rate Limiter (`src/lib/rate-limit.ts`) backed by **Redis** (`ioredis`) to prevent brute-force attacks and SMS/Email abuse on sensitive auth endpoints (`login`, `register`, `requestPasswordReset`, `sendOtp`).
20. **Enterprise Background Jobs & Queue (BullMQ)**: (✅ Completed) Replaced the old "Lazy-Cleanup" architecture for cart reservations and flash sales with a robust, enterprise-grade Background Job system using **Redis** and **BullMQ**. Created `cartCleanupQueue` and `flashSaleQueue` that run asynchronously in a separate Next.js Custom Server / Worker (`src/worker-server.ts`), guaranteeing high-performance non-blocking executions for time-sensitive tasks.
21. **Advanced Redis Caching**: (✅ Completed) Migrated heavy DB queries (Popular Products, Flash Sales, Recommender) to Redis using a generic `withCache` wrapper. Implemented cache invalidation patterns (`invalidateCachePattern`) triggered by Server Actions and background workers.
22. **Sentry & Pino (Monitoring)**: (✅ Completed) Integrated `@sentry/nextjs` for full-stack error tracking in edge, client, and server environments. Replaced native `console.log` with `pino` structured logging, injecting user context (`userId`) into every log for deep traceability in Kibana/Datadog.
23. **Security Enhancements**: (✅ Completed) Upgraded the Rate Limiter with an atomic Lua script to eliminate edge-case memory leaks during high traffic. Implemented automated JWT Secret Key rotation every month using BullMQ to secure user sessions.
24. **Database Optimization (Indexing)**: (✅ Completed) Analyzed `schema.prisma` and applied targeted `@@index` annotations across lookup keys (`userId`, `categoryId`, `productId`) and sorting fields (`createdAt`, `status`) to ensure O(log N) response times during enterprise-scale operations.

## 📌 Future Scope & Excluded Features
- **Support Chat System**: Will use a third-party service in the future. Do not implement a custom chat system.
- **Payment Gateway**: Real payment gateway integration is deferred until final deployment. The mock gateway is sufficient for now.

## 📧 Provider-Agnostic Email System (Architecture)
The email system is designed to be completely independent of any specific vendor, allowing it to work with a personal Mail Server (like Postfix/Exim) or third-party APIs (like Resend, SendGrid) without changing any code.

- **Templating**: Emails are built using `@react-email/components` and Tailwind CSS in `src/emails/OrderStatusEmail.tsx`.
- **Sending Engine**: `Nodemailer` handles SMTP transport in `src/lib/email.ts`.
- **Usage**: To connect a real mail server, simply fill out the `SMTP_*` variables in the `.env` file. If `SMTP_HOST` is left empty, the application will automatically mock the email by logging the contents to the terminal console, allowing for uninterrupted local development.

*The codebase is perfectly clean, type-checked, and the latest code is pushed to the local working directory.*
