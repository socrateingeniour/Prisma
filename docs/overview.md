# Project Overview

This document serves as the primary overview for the Prisma project, combining the original onboarding brief with a log of our progress.

---

## Progress Log

-   **Project Foundation:**
    -   Established a multi-feature, framework-free project structure using a `src/modules/` pattern.
    -   Created a unified CSS variables file at `src/css/variables.css` to manage the color palette and global styles.
-   **Documentation & Blueprints:**
    -   Created a blueprint for a future global settings panel (`docs/SETTINGS_BLUEPRINT.md`).
    -   Thoroughly analyzed the original `roadmap.html` prototype.
    -   Developed a comprehensive set of architectural blueprints for the **Roadmapper** module, covering:
        -   UI & Component Architecture (`UI-Component.md`)
        -   Content & Info Card Architecture (`cards.md`)
        -   Data Flow & State Management (`dataflow.md`)
        -   Theming System (`theming.md`)
        -   Database & Repository Pattern (`database-arch.md`)

---

## **Subject: Project Onboarding: Introduction and Brief for the Prisma Roadmapper Feature**

Welcome to the team! This document will serve as your onboarding guide for a key feature called "Roadmapper."

The attached `sample1.html` is an early-stage prototype. Your role will be to refine this prototype, fix existing issues, and build it out according to the vision outlined in the new architectural blueprints.

### **1. Project Vision**

**Prisma** is an educational platform designed to help students navigate their academic and career paths.

The **Roadmapper** feature is a core component of Prisma. Its purpose is to create dynamic and interactive visualizations of a student's potential journey to a specific profession. It helps them understand the milestones, skills, and choices involved, making their long-term goals feel more tangible and achievable.

### **2. Current State & Immediate Priorities**

The prototype is functional but requires a complete refactoring to align with the new architecture. The immediate priority is to implement the foundational structure as defined in the blueprints.

**High-Priority Tasks:**

*   **A. Implement Core Architecture:**
    *   Set up the directory structure as specified in `dataflow.md`.
    *   Create the `ThemeManager.js` to handle the "Dark Ocean" theme.
    *   Implement the `store.js` state manager with the observer pattern.
    *   Establish the main application entry point in `main.js`.

*   **B. Develop UI Components:**
    *   Build the primary UI components (`EditorToolbar`, `ViewportToolbar`, `InfoPanel`, `Canvas`) as defined in `UI-Component.md`.
    *   Implement the new "Info Card" system (`CardManager.js`) as specified in `cards.md`.

### **3. Known Issues & Architectural Decisions (Post-Blueprint)**

This section tracks the evolution of issues from the initial prototype. Many have been resolved or superseded by new architectural blueprints.

*   **Bridge Path Gradients:**
    *   **Status:** **Addressed.**
    *   **Resolution:** The `UI-Component.md` blueprint specifies a robust rendering solution. The `Canvas` component is now required to implement "Geometry-Aware Gradients" that follow the path's trajectory for both `structured` and `organic` path styles.

*   **Anchor / Flask Component:**
    -   **Status:** **DEPRECATED.**
    -   **Resolution:** The concept of an "Anchor" or "Flask" component has been removed from the architecture. The `UI-Component.md` blueprint officially deprecates it to simplify user interaction. All connections are now made directly from Node-to-Node, eliminating an unnecessary layer of complexity.

### 4. Goal Architecture & Code Refactoring

To ensure scalability and maintainability, the project will follow a robust, modular architecture designed for vanilla HTML, CSS, and JavaScript.

**Overall Prisma Platform Structure:**
```
/
├── index.html              # Main application entry point/homepage
├── assets/                 # Global assets (images, fonts)
├── docs/                   # Project documentation
└── src/
    ├── css/                # Global CSS
    │   ├── main.css
    │   └── variables.css
    ├── js/                 # Global JavaScript
    │   └── main.js
    └── modules/            # Self-contained feature modules
        ├── roadmapper/
        ├── college-profile/
        └── ...
```

**Detailed Roadmapper Module Structure (from `dataflow.md`):**
```
/src/modules/roadmapper/
├── roadmapper.html             # The HTML shell for the module.
├── themes/
│   └── dark-ocean.theme.json
├── css/
│   ├── themes.css
│   └── themes/
│       └── _dark-ocean.css
└── js/
    ├── main.js                 # The application's entry point.
    ├── store.js                # The global state management object.
    ├── ThemeManager.js         # The dedicated module for handling themes.
    ├── initial-data.js         # Contains the default roadmap data.
    └── components/
        ├── Canvas.js
        ├── EditorToolbar.js
        ├── ViewportToolbar.js
        ├── InfoPanel.js
        ├── Minimap.js
        └── NodeEditor.js
```
This structure promotes separation of concerns and modularity without relying on a framework.
