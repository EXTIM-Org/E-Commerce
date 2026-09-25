# Changelog

## [Unreleased]

### Added
- **Mobile Responsiveness Enhancements**:
  - Implemented a responsive mobile hamburger menu in the global `Header.tsx` for accessible mobile navigation.
  - Developed a toggleable `AdminSidebarWrapper` for the Admin Dashboard to prevent the sidebar from taking up full vertical space on mobile devices.
  - Applied Persian digit localization to Admin Dashboard statistics (Total Products, Orders, Users).
- **Global Pagination System**: Implemented a reusable, server-side compatible `<Pagination>` component (`src/components/ui/Pagination.tsx`).
  - Added support for query preservation during pagination.
  - Pagination applied to Admin Orders, User Profile Orders, Admin Returns, Admin Tickets, and Admin Users pages.
  - Implemented RTL layout fix: The pages flow Left-to-Right logically (Previous < 1 2 3 > Next) while keeping the site's overall Right-to-Left alignment for Persian.
- **Persian Localization (Numbers)**: 
  - Integrated `toLocaleString('fa-IR')` globally across the application for prices and dates to ensure foolproof Persian number formatting.
  - Implemented `e2p` utility (`src/lib/persian.ts`) for raw numbers (like counts, inventory quantities, phone numbers, postal codes, and lengths).
  - Ensured all dashboard charts (e.g., RevenueChart, TopProductsChart), email receipts, and data tables consistently display Persian digits regardless of the user's browser font configuration.
- **Admin Users Enhancements**:
  - Granted standard `ADMIN` users access to the User Management section.
  - Added strict server-side and client-side security measures to prevent regular admins from modifying the roles of other admins, or promoting users to `ADMIN` or `SUPER_ADMIN`.
  - The `SUPER_ADMIN` role remains highly protected and completely unchangeable.
  - Added a simulated "ارسال پیامک" (Send SMS) feature in the User Profile CRM controls, with character counting and console logging for simulation.
- **Return Management**:
  - Added a "تاریخ و ساعت" (Date & Time) column to the Returns management table for better chronological tracking.
- **Support Tickets**:
  - Implemented an automatic cron job (via BullMQ) that automatically changes ticket status to `CLOSED` if a ticket has been `WAITING_FOR_USER` for over 72 hours.
  - Added a robust Ticket Feedback system: Users are now presented with an interactive survey (Star Rating with hover effects, Like/Dislike, Text Comment) when their ticket is Closed or Resolved. (Added `TicketFeedback` Prisma model).
  - Admins can now view customer feedback directly within the Admin Ticket Details page with dynamic color-coded UI based on the feedback score.
  - Updated descriptive texts in the user profile ticket list to clarify automatic closing rules.

### Fixed
- Fixed an `Unauthorized` error when managing blog categories by updating the permissions check in `createArticleCategory` to properly utilize the `canManageBlog` utility, allowing `SUPER_ADMIN` and `BLOG_ADMIN` to create categories.
- Resolved a critical `react-hooks/static-components` error in `Pagination.tsx` by extracting the `PageWrapper` component outside the render loop, optimizing performance and state retention.
- Fixed a TypeScript syntax error (`TS1003`) in `src/actions/bulk-import.ts`'s catch block.
- Executed a comprehensive ESLint cleanup across the codebase, removing over 17 unused imports and variables to achieve a 100% warning-free state.
- Updated `eslint.config.mjs` to properly ignore unused variables prefixed with an underscore (`_`), aligning with standard TypeScript practices.
- Fixed an issue in `src/app/admin/users/page.tsx` where a runtime exception (`ReferenceError: searchQuery is not defined`) occurred during search pagination.
- Fixed an issue where `.toLocaleString()` would fallback to English digits by explicitly passing `'fa-IR'`.
