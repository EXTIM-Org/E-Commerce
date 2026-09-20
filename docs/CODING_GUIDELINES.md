# Coding Guidelines

Adhering to these principles is mandatory to maintain clean code and facilitate team collaboration.

## 1. Naming Conventions
- **Variables & Functions:** `camelCase`
- **React Components & Classes:** `PascalCase` (e.g., `ProductCard.tsx`)
- **Files:** Component files must be `PascalCase`. Other files (like utilities) should be `camelCase` or `kebab-case`.
- **Constants:** `UPPER_SNAKE_CASE`

## 2. Directory Structure (Frontend)
- `src/components`: Reusable UI components and layouts.
- `src/app`: Routes and main pages in Next.js.
- `src/lib` or `src/utils`: Helper functions and utilities.
- `src/store`: State management (Zustand).
- `src/types`: TypeScript interfaces and types.

## 3. Clean Code Principles
- **Small Functions:** Every function should do only one thing (Single Responsibility).
- **Don't Repeat Yourself (DRY):** Move common logic into helper functions or reusable components.
- **Strong Typing:** The use of `any` in TypeScript is strictly forbidden unless absolutely necessary (must be accompanied by an explanatory comment).

## 4. Security & Validation
- Always validate user input on the server side (in Server Actions and Route Handlers). Using Zod is highly recommended.
- Never hardcode secret keys or API keys. Always use `.env` files and ensure they are added to `.gitignore`.

## 5. Versioning
- **Latest Stable Versions:** Whenever installing packages, frameworks, or tools, always use the highest stable version. This ensures long-term maintainability and reduces the need for frequent upgrades or dealing with deprecated code in the near future.

## 6. Language & Localization (Persian / RTL)
- **Language:** The primary language of the platform is Persian (Farsi). All UI components, messages, and static texts must be written in Persian.
- **RTL Support:** The layout is completely Right-To-Left. Use logical Tailwind classes (e.g., `ps-*`, `pe-*`, `ms-*`, `me-*`) instead of directional classes (`pl-*`, `pr-*`) to ensure perfect compatibility with RTL layouts.
