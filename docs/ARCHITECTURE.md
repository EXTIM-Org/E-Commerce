# System Architecture

This system is designed based on a monolithic (Full-stack) architecture utilizing modern Next.js capabilities.

## Full-stack Approach (Next.js)
- The application is built on **Next.js (App Router)**.
- Instead of a separate backend server, we use **Server Actions** and **Route Handlers** directly within Next.js. This significantly reduces network latency and improves page load times.
- Hybrid rendering (SSR/SSG) ensures the system is fully optimized for SEO.

## Database
- **PostgreSQL** is used as the primary relational database for secure and structured data storage.
- **Prisma ORM** is utilized to communicate with the database directly from the Next.js server layer, ensuring type safety without the need for an intermediate API layer.

## Smart Recommender System
In the first phase, this system will include:
1. **Content-based Filtering:** Suggesting similar products based on categories and tags.
2. **Collaborative Filtering (User Behavior):** Tracking customer shopping carts and displaying complementary products.
3. **Popular Products:** Intelligently displaying top-selling and most-viewed items using optimized database queries.
