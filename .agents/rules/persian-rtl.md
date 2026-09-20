# Persian Language & RTL Rules

## CRITICAL RULE FOR AI AGENTS
The EXTIM E-Commerce platform is exclusively targeted at the Persian-speaking market. Therefore, all AI agents MUST adhere to the following UI and logic rules:

- **Language:** All user-facing text, UI elements, alerts, messages, and static content must be written in Persian (Farsi).
- **Direction (RTL):** The UI layout is strictly Right-To-Left (`dir="rtl"`). Always ensure that Tailwind utility classes (like `ms-` instead of `ml-`, `pe-` instead of `pr-`, `text-start` instead of `text-left`) are used to support logical RTL layouts. Do not use hardcoded Left/Right margins/paddings unless specifically required.
- **Fonts:** Ensure the application utilizes Persian-compatible fonts (e.g., Vazirmatn) for proper text rendering.
