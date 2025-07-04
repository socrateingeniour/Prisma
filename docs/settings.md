# Blueprint: Global Application Settings

This document outlines the plan for implementing global user-configurable settings for the Prisma platform. The goal is to provide users with robust control over their viewing experience, focusing on theming and print options.

---

## 1. Global Settings Module

A central settings panel or modal will be created. This UI element will be accessible from a consistent location in the main application header or navigation bar.

-   **Accessibility:** The settings icon/button will be clearly visible and accessible from anywhere in the application.
-   **Functionality:** It will house all global controls, starting with Theme Selection and Print Style Configuration.
-   **Persistence:** All selected settings will be saved to the browser's `localStorage` to ensure they persist between user sessions.

---

## 2. Theming System

The application will support multiple visual themes to cater to user preferences and accessibility needs, managed by a dedicated `ThemeManager.js`.

### 2.1. Implementation Mechanism

-   **ThemeManager.js:** A global JavaScript module responsible for loading and managing themes.
-   **JSON Manifests:** Each theme is defined by a `.json` file (e.g., `dark-ocean.theme.json`) that specifies the theme's name, CSS file, fonts, icons, and enabled visual effects.
-   **CSS Variables:** A `data-theme` attribute on the `<body>` tag will activate the corresponding theme's CSS variables, which are defined in separate `.css` files (e.g., `_dark-ocean.css`). This allows for clean separation of theme styles.

### 2.2. Themes to Implement

1.  **Dark Ocean (Default):** The initial theme for the application.
2.  **Light Mode:** A standard light theme for high readability.
3.  **High-Contrast / Accessible:** A theme designed to meet WCAG AAA standards.

---

## 3. Print Style System

To provide a high-quality experience for users who wish to print content from any module, a dedicated and configurable print style system will be implemented.

### 3.1. Implementation Mechanism

-   A primary print stylesheet will be created at `src/css/print.css` and linked in the main `index.html` with `media="print"`.
-   JavaScript (likely within the global settings manager) will add a class to the `<body>` element based on the user's selection (e.g., `<body class="print-ink-saver">`).
-   The `print.css` file will use these classes to apply different sets of rules.

### 3.2. Print Profiles

The user can select one of the following print profiles from the settings panel:

1.  **Full Color (Default):** Prints the page exactly as it appears on screen.
2.  **Ink-Saver:** Reduces ink usage by removing backgrounds and ensuring high-contrast text.
3.  **Bare Bones / Content-Only:** Prints only the essential content of a module, hiding all surrounding UI.
