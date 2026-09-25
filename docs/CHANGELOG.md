# Changelog

## [Unreleased]

### Added
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

### Fixed
- Fixed an issue in `src/app/admin/users/page.tsx` where a runtime exception (`ReferenceError: searchQuery is not defined`) occurred during search pagination.
- Fixed an issue where `.toLocaleString()` would fallback to English digits by explicitly passing `'fa-IR'`.
