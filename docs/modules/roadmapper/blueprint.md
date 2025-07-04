# Roadmapper Module Blueprint

This document contains the complete technical specification for the Roadmapper module, unifying all architectural blueprints into a single, comprehensive guide.

---

# **Part 1: Architecture & Data Flow**

This document specifies the technical architecture, file organization, and state management pattern for the Prisma Roadmapper module. It defines how the application is structured and how data flows through its components.

## **1.1: Final Directory Structure**

This is the definitive file and folder layout for the `roadmapper` module.

```
/src/modules/roadmapper/
├── roadmapper.html                # The HTML shell for the module. Only contains empty container divs.
├── themes/
│   └── ...                     # (As defined in theming.md)
├── css/
│   ├── themes.css              # Main import file for all theme CSS.
│   └── themes/
│       └── ...                 # (As defined in theming.md)
└── js/
    ├── main.js                 # The application's entry point and orchestrator.
    ├── store.js                # The global state management object (The "Brain").
    ├── ThemeManager.js         # The dedicated module for handling themes.
    ├── initial-data.js         # Contains the default roadmapper data for first load.
    └── components/
        ├── Canvas.js           # Renders nodes, paths, and handles canvas interactions.
        ├── EditorToolbar.js    # Manages the editor button and its associated panel.
        ├── ViewportToolbar.js  # Manages the zoom/pan/minimap controls.
        ├── InfoPanel.js        # Manages the info modal with its tabs.
        ├── Minimap.js          # Manages the minimap overview and navigation.
        └── NodeEditor.js       # Manages the modal form for editing a node's details.
```

## **1.2: The Orchestrator - `main.js`**

*   **Role:** The "Conductor" of the application. Its sole responsibilities are initialization and orchestration.
*   **Execution Flow on `DOMContentLoaded`:**
    1.  **Initialize Systems:**
        *   Imports and awaits `ThemeManager.loadTheme('dark-ocean')`.
        *   Imports the `store` object from `store.js`.
    2.  **Load Initial Data:**
        *   Checks `localStorage` for any saved roadmapper data.
        *   If none is found, it imports `initialData` from `initial-data.js`.
        *   It then populates the `store` with this data.
    3.  **Instantiate Components:**
        *   Creates a `new` instance of every component class from the `js/components/` directory (e.g., `const canvas = new Canvas(...)`, `const editorToolbar = new EditorToolbar(...)`).
    4.  **Render & Mount:**
        *   Calls the initial `render()` method on each component, which will generate their initial HTML and inject it into the appropriate container `div` in `roadmapper.html`.
    5.  **Establish Reactivity:**
        *   Subscribes the `Canvas` component to the `store` (`store.subscribe(canvas.render)`). This is the key link that ensures the canvas always reflects the current state.
        *   Sets up global event listeners for component-to-component communication (e.g., listening for a 'showInfoPanel' event to trigger the `InfoPanel`'s show method).

## **1.3: The Brain - The `store.js` State Manager**

The `store` is the **single source of truth** for all application data. No component will ever hold its own copy of the roadmapper data.

*   **Core Principle:** We will use the **Observer Pattern**. The store maintains a list of "subscribers" (functions to call when something changes) and notifies them after its data has been modified.

*   **Structure of `store.js`:** It will export a single `store` object with the following properties:

    1.  **`state` (The Data):** A private object holding all the data.
        ```javascript
        let state = {
          nodes: [],
          connections: [],
          branches: [],
          ui: {
            isEditorActive: false,
            pathStyle: 'structured',
            lockState: 'locked',
            selectedElement: { id: null, type: null },
            // ...other UI states
          }
        };
        ```
    2.  **`subscribers` (The Listeners):** A private array to hold callback functions.
        ```javascript
        let subscribers = [];
        ```
    3.  **Public Methods (The API):**
        *   **`getState()`:** Returns a copy of the current `state`.
        *   **`subscribe(callback)`:** Adds a function to the `subscribers` array.
        *   **`notify()`:** A private method that iterates through the `subscribers` array and calls each function. This is the "update" signal.
        *   **Mutations (Action Methods):** A collection of methods that are the *only way* to change the state. Every mutation method **must** call `notify()` at the end of its execution.
            *   `addNode(nodeData)`
            *   `updateNodePosition(nodeId, newCoords)`
            *   `selectElement(id, type)`
            *   `toggleEditor(isActive)`
            *   *...and so on for every possible action.*

## **1.4: Component Communication Model**

This defines how our isolated components work together as a cohesive whole.

*   **Components -> Store (Writing/Actions):** Components **never** change the state directly. They can only call the store's public action methods.
    *   **Example:** When the "Editor Toggle" button in the `EditorToolbar` is clicked, its event listener will call `store.toggleEditor(true)`. It doesn't know or care what happens next; it has done its job.

*   **Store -> Components (Reading/Reacting):**
    *   **The `Canvas`** is the primary subscriber. When `notify()` is called, its `render` method is triggered, and it redraws the entire canvas based on the fresh data from `store.getState()`. This is how the UI "reacts" to data changes.
    *   **Other components** can also subscribe if they need to react to specific state changes (e.g., the `EditorToolbar` might subscribe to re-render itself to enable/disable buttons based on the `selectedElement`).

*   **Component -> Component (Decoupled Events):** For communication that doesn't need to be part of the global state (like a button in one component opening a modal in another), we will use global `CustomEvents`.
    *   **Example:** The `EditorToolbar` dispatches `new CustomEvent('show:infoPanel')`. The `main.js` orchestrator listens for this event and calls the public `show()` method on the `InfoPanel` instance. This prevents the two components from needing to know about each other directly.

---

# **Part 2: Component & UI Architecture**

This document serves as the primary technical specification for all user interface (UI) components and user experience (UX) interactions within the Prisma Roadmapper module. It defines the visual appearance, layout, and behavior of every element on the screen, based on the **Default "Dark Ocean" Theme**.

## **2.1: UI Control Surfaces**

The application's interface is divided into two primary, fixed-position control areas.

### **2.1.1. The Editor Toolbar (Top-Left)**

*   **Purpose:** To manage "Editor Mode" and provide tools for creating and modifying the **data** of the roadmapper.
*   **Availability:** The main toggle is always visible, but the full toolbar panel is only revealed when Editor Mode is active.
*   **Component Breakdown:**
    *   **Editor Toggle Button:** A circular button with a pencil icon (`edit` role). Clicking it toggles Editor Mode. When active, the button itself gains an active-state glow (`--color-accent-primary`) and the Editor Panel becomes visible.
    *   **Editor Panel:** A slide-out panel containing all contextual editing actions. The state of its buttons depends on the user's selection on the canvas.
        *   **`Add Node`**: Enabled when a `Main Path` or `Bridge Path` is selected.
        *   **`Add Branch`**: Enabled when a `Parent Node` is selected.
        *   **`Lock State Toggle`**: Cycles node dragging permissions (`Locked`, `Limited`, `Free`).
        *   **`Path Style Toggle`**: Switches path rendering between `structured` and `organic`.
        *   **`Save Roadmap (Export)`**: Exports the current state to a `.json` file.
        *   **`Load Roadmap (Import)`**: Opens a file dialog to load a `.json` file.

### **2.1.2. The Navigation & Viewport Toolbar (Top-Right)**

*   **Purpose:** To provide tools for manipulating the **view** of the roadmapper canvas.
*   **Availability:** Always visible and accessible, regardless of Editor Mode.
*   **Component Breakdown:**
    *   **Zoom Controls:**
        *   `Zoom In` button (`zoomIn` icon).
        *   `Zoom Out` button (`zoomOut` icon).
        *   `Zoom Level Indicator`: A text display (e.g., "100%"). Clicking resets zoom to 100%.
    *   **Scroll Behavior Toggle:** A single button that switches the mouse wheel's function. The icon changes to reflect the state:
        *   **State 1 (Default): "Zoom"** (`toggleScrollZoom` icon).
        *   **State 2: "Pan"** (`toggleScrollPan` icon for vertical scroll).
    *   **Minimap Toggle (`minimap` icon):** Shows or hides the Minimap component.

## **2.2: Core Canvas Elements**

These are the primary building blocks of the roadmapper visualization.

### **2.2.1. Node**

*   **Purpose:** Represents a milestone, skill, or task.
*   **Variants:**
    *   **`Parent Node`**: Large, circular, a major milestone and structural backbone of a branch.
    *   **`Secondary Node`**: Smaller, circular, a sub-task hierarchically linked to a Parent Node.
*   **Visual States ("Dark Ocean" Theme):**
    *   **Default:** Displays its branch color and an icon from the theme's icon map.
    *   **Hovered (Key Distinction):**
        *   **Parent Node:** Scales up, gains a soft `box-shadow` glow, and its **border animates to a crisp white color**, signifying primary importance.
        *   **Secondary Node:** Scales up and glows but **does not** receive the white border, keeping it visually subordinate.
    *   **Selected:** (Editor Mode) A `.selected` class is applied, triggering a rhythmic `pulse-glow` animation on its `box-shadow`.
    *   **Inactive:** Fades to the `--color-inactive-blue` color.
*   **Interaction:** Clicking a node in editor mode selects it.

### **2.2.2. Path**

*   **Purpose:** Visually connects nodes, representing progression or relationships. All are SVG elements.
*   **Variants & Style ("Dark Ocean" Theme):**
    *   **`Main Path`**: Connects `Parent Nodes` in a branch. Styled as a thick (`--path-stroke-width-main`), solid line, colored by its branch. It is selectable.
    *   **`Secondary Path`**: Connects a `Secondary Node` to its `Parent`. Styled as a thinner (`--path-stroke-width-secondary`), dashed line, colored by its branch. It is **not** selectable.
    *   **`Bridge Path`**: Connects a `Parent Node` from one branch to a `Parent Node` of another. Styled as a thick (`--path-stroke-width-bridge`) path with a dynamic color gradient. It is selectable.
*   **Critical Feature: Geometry-Aware Gradients (for Bridge Paths)**
    *   **Mandate:** The gradient styling a Bridge Path **must** visually follow the path's exact trajectory. The `Canvas` rendering logic must inspect the `pathStyle` and use the appropriate method:
    *   **For `organic` style:** Use the **Single Gradient Method**, a single `<linearGradient>` defined from the start node's coordinates to the end node's.
    *   **For `structured` style:** Use the **Path Segmentation & Color Interpolation Method**. The renderer must algorithmically break the S-curve into its constituent straight line segments. Each segment is then rendered as a *separate* `<path>` element in the SVG, each with its own uniquely calculated, interpolated gradient. This is required to create a seamless color flow around the 90-degree corners.
*   **Visual States ("Dark Ocean" Theme):**
    *   **Selected:** (Editor Mode) A `.path-highlight` class is applied, triggering a vibrant, "crawling" `path-glow` animation on its stroke.

### **2.2.3. Anchor / Flask Component**

*   **Status:** **DELETED / DEPRECATED**.
*   **Reasoning:** The concept of an intermediate anchor point was determined to be an unnecessary layer of complexity. The user interaction is now more direct and intuitive: connections are made from **Node-to-Node**. The functionalities of creating a new branch or bridging between existing ones now originate directly from the `Parent Node` itself.

## **2.3: Major UI Components**

### **2.3.1. The Minimap**

*   **Purpose:** Provides a high-level overview and quick navigation.
*   **Layout:** A vertical bar containing clickable sections representing each branch.
*   **Interaction:** Clicking a branch scrolls the main canvas to that section. As the main canvas is scrolled manually, the corresponding minimap section becomes active.

### **2.3.2. The Information Panel**

*   **Purpose:** To display user-facing help and developer documentation.
*   **Layout:** A modal window with a tabbed interface, triggered by the circular `info` icon button.
*   **Tabs:**
    *   `"Concepts & Ideas"`: A user tutorial.
    *   `"Technical Overview"`: To display content from project documentation (`components.md`, etc.).
    *   `"Code & Issue Tracker"`: An internal development log.

### **2.3.3. Action Feedback Effects ("Dark Ocean" Theme)**

*   **Particle Burst:** A celebratory, JavaScript-driven burst of small particles that emanates from an element (node or path) the moment it is successfully selected in Editor Mode, providing a rewarding and "juicy" feel to interactions.

---

# **Part 3: Content & Info Card Architecture**

This document details the architecture for displaying rich, interactive content via "Info Cards." This is the primary user experience when Editor Mode is **OFF**.

## **3.1. Architectural & Data Flow Impact**

This feature introduces a new "Explore Mode" and requires significant changes to our state and data structure.

### **3.1.1. New "View Mode" in State**

The `store.js` must be updated to manage the application's overall mode.

```javascript
// In store.js, inside the 'state' object
let state = {
  //... other state properties
  viewMode: 'explore', // New! Can be 'explore' or 'edit'. Default is 'explore'.
  activeCard: {          // New! Tracks the currently displayed card.
    nodeId: null,        // The ID of the node that was clicked.
    displayState: 'hidden', // 'hidden', 'peek', 'docked', 'fullscreen'
    activeSubCard: null  // e.g., 'course' or 'college'
  }
};
```
*   Toggling the Editor button now simply switches `store.viewMode` between `'edit'` and `'explore'`.
*   Clicking a Node in `explore` mode will now trigger a new action, like `store.showCardForNode(nodeId)`.

### **3.1.2. A Richer Data Structure**

Our node objects in `initial-data.js` are no longer simple. They must now contain the data for their cards or, more scalably, references to external data files.

**Example Node Object in `initial-data.js`:**
```javascript
{
  id: 'cs101',
  type: 'parent',
  branch: 'first_year',
  title: 'Intro to Computer Science',
  icon: 'node-default',
  //...
  content: {
    brief: "A foundational course covering core concepts of programming and data structures.",
    stats: { "Difficulty": "3/5", "Workload": "Medium" },
    cards: [
      { type: 'course', data_source: './data/courses/cs101.json' },
      { type: 'college', data_source: './data/colleges/ucla.json' }
    ]
  }
}
```
*   A new `/data/` directory will store these detailed `.json` files. This keeps our initial data file light and loads rich content on demand.

## **3.2. New Core Component: The `CardManager`**

A new top-level component, `CardManager.js`, will orchestrate the entire card experience.

*   **Role:**
    *   It subscribes to the `store` and listens for changes to `state.activeCard`.
    *   When a node is selected, it renders the main `NodeCard` container.
    *   Based on the `activeCard.displayState`, it applies the correct CSS classes to manage the card's visibility and position (`peek`, `docked`, `fullscreen`).
    *   It fetches the necessary data from the JSON files specified in the node's `content.cards` array.
    *   It passes this data down to the specific sub-card components (`CourseCard`, `CollegeProfileCard`) for rendering.

## **3.3. The Card Component Hierarchy & UX Flow**

This defines the different types of cards and how the user interacts with them.

### **3.3.1. Level 1: The `NodeCard` (The "Peek" View)**

*   **Trigger:** Clicking a Node when `viewMode` is `'explore'`.
*   **Appearance:** The card appears directly beneath or in place of the node itself (using a transform/animation to "grow" from the node). It's a small, non-intrusive view.
*   **Content:**
    *   The `brief` description from the node's `content` object.
    *   The `stats` information.
    *   A "Settings" area (e.g., location, college).
    *   **Crucially:** It displays small, non-interactive "preview" stubs for the child cards (e.g., a "Course Details" button and a "UCLA Profile" button). These act as the triggers for the next level.

### **3.3.2. Level 2: The Docked View (The "Side Box")**

*   **Trigger:** Clicking a "preview" stub inside the `NodeCard`'s "Peek" view.
*   **Appearance:** The card detaches from the node and animates smoothly to a docked position on the side of the screen (e.g., the right side). The main canvas content may need to subtly shift or scale down to make room. This is the main "working" view for a card.
*   **Content:**
    *   The content of the main `NodeCard` is now visible in a header area.
    *   The full, detailed content of the selected **sub-card** (`CourseCard` or `CollegeProfileCard`) is rendered below it.

### **3.3.3. Level 3: The Fullscreen View (The "Deep Dive")**

*   **Trigger:** Clicking an "Expand" icon within the header of the Docked View.
*   **Appearance:** The side box animates to take over most of the screen. The roadmapper canvas in the background becomes blurred or darkened with an overlay to focus the user's attention completely on the card's content. A prominent "Close" or "Shrink" icon is visible.
*   **Content:** The same content as the Docked View, but with more generous spacing and potentially larger text/images for an immersive reading experience.

## **3.4. The Sub-Card Components (The Content Payloads)**

These are the components that render the rich data fetched by the `CardManager`.

### **3.4.1. The `CourseCard.js`**

*   **Renders data like:** Detailed description, prerequisites, student tips/opinions, links to external resources, etc.

### **3.4.2. The `CollegeProfileCard.js`**

*   **This is a high-detail, specialized component.** It will render a structured layout based *exactly* on the specific sections you've designed. It will have dedicated sub-components or functions for rendering each part:
    *   **Compact View:** A table with Rank, Visa Info, etc.
    *   **Heritage & Identity:** A section with narrative text.
    *   **Gateway:** A section focusing on student-specific data. **The implementation must NOT hardcode the country.** It should use a global configuration setting (e.g., in the user's profile/`store`) to determine which country's data to display and which currency to convert to.
    *   **Decision Matrix:** Renders a weighted score table.
    *   **Sources & Methodology:** A formatted list of links and dates.

---

# **Part 4: Data Architecture (Final & Future-Proof)**

This document specifies a table-based architecture for our client-side JSON databases. The architecture is explicitly designed with a **Repository Pattern** to ensure the data source can be swapped in the future (e.g., to MySQL) with minimal changes to the application's UI code.

## **4.1: The Data "Table" Schema**

(1. The "JSON Table" Principle)

Instead of an object where IDs are keys, each of our `.database.json` files will be structured as an object containing two key properties:

1.  **`columns`**: An array of strings that defines the "header" or schema for our table. This is our single source of truth for the data structure.
2.  **`records`**: An array of arrays, where each inner array represents a "row" of data. The order of data in each row **must** correspond to the order of the `columns`.

### **4.1.2. The New `.database.json` Schema**

This is the key change. This format is much easier to edit, especially for adding new entries.

**Example: `data/colleges.database.json`**
```json
{
  "columns": [
    "id",
    "name",
    "rank",
    "heritage_identity_md", 
    "global_positioning_md",
    "academic_ecosystem_md",
    "gateway_info_md"
  ],
  "records": [
    [
      "ucla", 
      "University of California, Los Angeles", 
      3, 
      "Established in 1919, UCLA's soul is defined by its public service mission...", 
      "Ranked #1 among US public universities...", 
      "The engineering department is a powerhouse, especially in AI research. Notable faculty...",
      "Visa success for Tunisian students is approximately 85%..."
    ],
    [
      "stanford",
      "Stanford University",
      2,
      "Founded by Leland Stanford in 1885, its spirit is entrepreneurial...",
      /* ... more markdown content ... */
    ]
  ]
}
```

*   **Note:** I've changed fields like "Heritage & Identity" to `heritage_identity_md` to signify that they will contain Markdown text, which our card components can later parse and render as rich HTML.

**Example: `data/courses.database.json`**
```json
{
  "columns": ["id", "title", "description_md", "credits"],
  "records": [
    ["cs101", "Intro to Computer Science", "A foundational course covering core concepts...", 3],
    ["math203", "Calculus II", "This course builds upon Calculus I with a focus on...", 4]
  ]
}
```

## **4.2: The New Two-Layer Data Architecture**

We will introduce a strict separation between the "Data Source" layer and the "Repository" layer.

### **4.2.1. The Data Source Layer (The "How")**

This layer is responsible for the low-level mechanics of fetching the raw data. This is the **only** part of the application that knows we are currently using JSON files.

*   **New Directory:** `js/data/sources/`
*   **Component Example: `js/data/sources/JsonDataSource.js`**
    *   **Role:** Handles all `fetch` logic for `.json` files.
    *   **Implementation:**
        ```javascript
        // A simple, low-level function for fetching ANY table
        async function fetchTable(tableName) {
            const response = await fetch(`./data/${tableName}.database.json`);
            if (!response.ok) {
                throw new Error(`Failed to load data source: ${tableName}`);
            }
            return await response.json();
        }

        export const JsonDataSource = {
            fetchTable
        };
        ```

*   **Future Upgrade Path:** If we were to switch to a MySQL backend, we would simply create a **new** file here: `js/data/sources/ApiDataSource.js`. This new file would have a `fetchTable` method that fetches from `https://my-api.com/{tableName}` instead. We would then swap which data source is being used in the next layer.

### **4.2.2. The Repository Layer (The "What")**

This layer acts as the **single, unified gateway** for the rest of the application. It defines *what* data you can get, but it relies on the Data Source layer to figure out *how* to get it. It transforms the raw table data into easy-to-use objects. This is the `Manager` from our previous discussion, but we'll call it a `Repository` to be more precise with industry terms.

*   **New Directory:** `js/data/repositories/`
*   **Component Example: `js/data/repositories/CollegeRepository.js`**
    *   **Role:** To provide a clean API for all college-related data queries. It **does not** do its own fetching.
    *   **Implementation:**
        ```javascript
        // Import the *current* data source
        import { JsonDataSource } from '../sources/JsonDataSource.js';

        let collegesById = null; // Private in-memory cache

        async function initialize() {
            if (collegesById) return;

            // Use the data source to get the raw table
            const dbTable = await JsonDataSource.fetchTable('colleges');

            // --- The key transformation step (unchanged) ---
            const columns = dbTable.columns;
            collegesById = {}; 
            for (const record of dbTable.records) {
                const collegeObject = {};
                for (let i = 0; i < columns.length; i++) {
                    collegeObject[columns[i]] = record[i];
                }
                collegesById[collegeObject.id] = collegeObject;
            }
        }

        function getById(id) {
            return collegesById ? collegesById[id] : null;
        }

        // Export the clean API
        export const CollegeRepository = {
            initialize,
            getById,
            // findAll(), etc.
        };
        ```
    *   Notice how this file has a "dependency" on `JsonDataSource`. This is the only place this dependency exists.

## **4.3: Final Data Flow & The Upgrade Path**

### **4.3.1. Current Data Flow (JSON)**

1.  **UI Component (e.g., `CollegeProfileCard.js`):** "I need the college with ID 'ucla'."
2.  **It calls:** `CollegeRepository.getById('ucla')`. The UI component knows nothing about JSON files or APIs.
3.  **`CollegeRepository.js`:** Looks up 'ucla' in its internal `collegesById` cache and instantly returns the formatted JavaScript object.
4.  *(Initialization, which happened at app start)*: `CollegeRepository.initialize()` called `JsonDataSource.fetchTable('colleges')`, which fetched the local `.json` file and provided the raw data for the repository to process.

### **4.3.2. Future Upgrade Path (e.g., MySQL via an API)**

When you are ready to switch to a real database:

1.  **Create New Source:** You build your API server. Then you create a new file: `js/data/sources/ApiDataSource.js`.
2.  **Edit One Line:** You go into `js/data/repositories/CollegeRepository.js` and change **only one line**:
    *   **Change this:** `import { JsonDataSource } from '../sources/JsonDataSource.js';`
    *   **To this:** `import { ApiDataSource } from '../sources/ApiDataSource.js';`
    *   (And you'd update the `initialize` method to use the new `ApiDataSource.fetchTable` function).
3.  **DONE.** Everything else in your application—the `CollegeRepository.getById()` function, the `CollegeProfileCard` component, all of your rendering logic—remains **100% untouched**. It continues to work perfectly because its "contract" with the `CollegeRepository` was never broken.

---

# **Part 5: The Theming Architecture**

This document details the complete system for implementing and managing visual themes within the Prisma platform. This architecture is designed to be modular, scalable, and data-driven, allowing for the easy creation and swapping of visual styles.

## **5.1. Core Philosophy**

The application is built on a "theming-first" principle. The visual appearance is not hardcoded; it is a configurable layer that sits on top of the application's structure and logic. Components should be "theme-agnostic," meaning they function correctly regardless of the theme applied.

## **5.2. Directory Structure**

To support this philosophy, a dedicated `/themes` directory will exist within the module.

```
/src/modules/roadmapper/
├── themes/
│   ├── dark-ocean.theme.json  # Manifest for the default theme
│   └── (future themes)...
├── css/
│   ├── themes.css             # Main import file for all theme CSS
│   └── themes/
│       ├── _dark-ocean.css    # Styles & variables for the default theme
│       └── (future themes)...
└── js/
    └── ThemeManager.js        # NEW: The dedicated JS module for theme logic
```

## **5.3. The JSON Theme Manifest**

The heart of each theme is a `.json` manifest file. This file acts as a configuration sheet, defining all of the theme's non-CSS properties. This externalizes visual decisions from the core JavaScript logic.

#### **File Example: `themes/dark-ocean.theme.json`**

```json
{
  "name": "Dark Ocean",
  "cssFile": "_dark-ocean.css",
  "effects": {
    "particles": true,
    "glow": true
  },
  "icons": {
    "set": "font-awesome",
    "map": {
      "edit": "fas fa-pencil-alt",
      "info": "fas fa-info",
      "branchDefault": "fas fa-layer-group",
      "nodeDefault": "fas fa-circle",
      "zoomIn": "fas fa-search-plus",
      "zoomOut": "fas fa-search-minus",
      "toggleScrollZoom": "fas fa-arrows-alt-v",
      "toggleScrollPan": "fas fa-mouse",
      "minimap": "fas fa-map-marked-alt"
    }
  },
  "fonts": {
    "body": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    "header": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  }
}
```
*   `"name"`: The user-facing name of the theme.
*   `"cssFile"`: The name of the corresponding CSS file to load.
*   `"effects"`: A boolean map to enable or disable computationally intensive JavaScript effects (e.g., a "high-performance" or "minimalist" theme could disable these).
*   `"icons"`:
    *   `"set"`: A reference to the icon library used (e.g., 'font-awesome', 'line-awesome').
    *   `"map"`: A critical dictionary that maps a generic, semantic role (e.g., `"edit"`) to a specific icon library class name (e.g., `"fas fa-pencil-alt"`). This allows components to request icons by their function, not their specific name.
*   `"fonts"`: Defines the font stacks for the theme.

## **5.4. The CSS Implementation**

The CSS implementation relies on two core concepts: the `data-theme` attribute and CSS variables with semantic naming.

#### **A. Semantic CSS Variables**
The primary CSS file for each theme (`css/themes/_dark-ocean.css`) will define a block of variables inside a `data-theme` selector. Naming must be semantic, describing the variable's *purpose*, not its color.

**File Example: `css/themes/_dark-ocean.css`**
```css
[data-theme='dark-ocean'] {
  /* ====== Palette ====== */
  --color-background-primary: #10142a;
  --color-background-secondary: #22284b;
  --color-text-primary: #e0e0e0;
  --color-text-muted: #8a93c4;
  --color-accent-primary: #25d0a9;
  --color-accent-secondary: #FFAA00;

  /* ====== Branch Colors ====== */
  --color-branch-1: #a55bf7;
  --color-branch-2: #5b8cff;
  --color-branch-3: #ff6b9c;
  --color-branch-4: #2dd4bf;
  
  /* ====== Fonts ====== */
  --font-family-body: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --font-family-header: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  /* ====== Paths ====== */
  --path-stroke-width-main: 7px;
  --path-stroke-width-secondary: 4px;
  --path-stroke-width-bridge: 8px;

  /* ====== Effects ====== */
  /* This enables glow animations. A theme could set these to 'none'. */
  --animation-glow-pulse: pulse-glow 1.5s infinite alternate;
  --animation-glow-path: path-glow 1s infinite alternate;
}
```

#### **B. Global Stylesheet Imports**
The `main.css` file is responsible for loading the CSS for *all* potential themes. The `data-theme` attribute on the body tag will then determine which set of variables is actually applied.

**File Example: `css/themes.css`**
```css
/* Import the base styles for every theme */
@import './themes/_dark-ocean.css';
/* @import './themes/_light-mode.css';  <-- For a future theme */
/* @import './themes/_minimalist.css'; <-- For a future theme */
```

## **5.5. The JavaScript `ThemeManager`**

The `ThemeManager.js` module is the single point of control for all theme-related logic in the application.

*   **Responsibilities:**
    1.  **Loading:** An `async loadTheme(themeName)` method will `fetch` the appropriate JSON manifest, parse it, and store it as the active configuration. It will then dynamically set `document.body.dataset.theme = themeName`.
    2.  **Asset Retrieval:** It provides helper methods that other components use to stay theme-agnostic.
        *   `getIcon(role)`: Looks up a role like "edit" in the current theme's icon map and returns the class string like "fas fa-pencil-alt".
        *   `getFont(type)`: Returns the font stack for "body" or "header".
        *   `isEffectEnabled(effectName)`: Returns `true` or `false` for "particles" or "glow".
    3.  **Initialization:** On application startup, `main.js` will call `ThemeManager.loadTheme('dark-ocean')` to ensure the default theme is applied.
