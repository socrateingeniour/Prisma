# Roadmap Functions Documentation

This document details the JavaScript logic and functions of the Roadmap module.

---

## 1. Initialization & State

-   **`initializeRoadmap()`**: This is the entry point for the entire application. It is called once the DOM is fully loaded. Its primary role is to orchestrate the initial setup by calling the data parsing and rendering functions.
-   **`parseNodesFromHTML()`**: This function is responsible for reading the hardcoded data from the hidden `div` elements within the `#roadmap-data` container. It iterates through these elements, extracts the `data-*` attributes, and transforms them into structured JavaScript objects that are then stored in the `allBranches` and `allNodesData` global arrays.

---

## 2. Rendering and Visuals

-   **`renderNodes(positions)`**: Takes the calculated positions of all nodes and dynamically generates the corresponding HTML `div` elements. It injects this HTML into the `#node-container`. This function is also responsible for assigning the correct classes and styles based on the node's properties (e.g., type, branch color).
-   **`drawPaths(positions)`**: This function is responsible for all visual lines on the canvas. It iterates through the node connections and generates SVG `<path>` elements. It calls `generatePath()` to get the correct path data and applies the appropriate classes (`.visible-path`, `.bridge-path`, etc.) and stroke colors.
-   **`generatePath(p1, p2, style)`**: A critical helper function that calculates the SVG path definition string. It can generate two types of paths based on the `style` parameter:
    -   `structured`: Creates paths with straight lines and sharp, 90-degree corners.
    -   `organic`: Creates smooth, curved Bezier paths.
-   **`createParticleEffect(...)`**: A utility function for visual flair. It dynamically creates and animates small `div` elements to produce a particle burst effect, typically used for user feedback on selection.

---

## 3. User Interaction & Event Handling

-   **`makeNodeDraggable(nodeEl)`**: This function makes a node interactive. It attaches `mousedown`, `mousemove`, and `mouseup` event listeners to the node element to implement the dragging logic. It respects the global `lockState` to determine if dragging is permitted.
-   **`selectPath(path)` / `selectElement(element)`**: These functions manage the selection state. When a user double-clicks a path or clicks a node/anchor in editor mode, these functions update the `selectedPath` or `selectedNode` state variables and apply a visual highlight (the `.path-highlight` or `.selected` class) to the element.
-   **`addNodeToPath()` / `addBranchFromNode()`**: These functions contain the logic for modifying the roadmap structure. They are called by the editor buttons and use the `selectedPath` or `selectedNode` variables to determine where to add the new element. They modify the `allNodesData` or `allBranches` arrays and then trigger a full re-render by calling `initializeRoadmap()`.
-   **`openNodeEditor(nodeId)` / `closeNodeEditor()` / `saveNodeChanges()`**: A group of functions that control the Node Editor modal. They handle populating the form with the selected node's data, showing/hiding the modal, and updating the `allNodesData` array with the new values upon saving.

---

## 4. UI Management

-   **`updateMinimapUI()` / `updateBranchManager()`**: These functions are responsible for keeping the minimap and the branch manager UI in sync with the application state, particularly the `activeBranchId`. They apply the `.active` class to the correct branch element.
-   **`scrollToBranch(branchId)`**: Implements the smooth scrolling behavior when a user clicks on a branch in the minimap.
-   **`logEvent(...)`**: A simple diagnostic utility. It takes action details, formats them into a log message, and prepends them to the `#log-entries` container for debugging purposes.
