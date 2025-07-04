# Roadmap Components Documentation

This document details the HTML structure and visual components of the Roadmap module.

---

## 1. Main Canvas

-   **`#roadmap-container`**: The primary container that holds the entire visualization. It establishes a relative positioning context for all nodes and paths.
-   **`#path-svg`**: An `<svg>` element that layers on top of the container. All connecting lines (paths) between nodes are drawn within this SVG.
-   **`#node-container`**: A `<div>` that also layers on top of the main container. All the interactive node elements are dynamically rendered inside this div.

---

## 2. Node and Path Elements

### 2.1. Nodes
-   **`.roadmap-node`**: The base class for any node on the map. It handles absolute positioning and the entry animation.
    -   **`.parent-node`**: A large, circular node representing a major milestone.
    -   **`.secondary-node`**: A smaller, circular node representing a sub-task or skill related to a parent node.
-   **`.anchor-node`**: A small, circular element used specifically to create visual connections between different branches of the roadmap.
-   **`.node-label`**: The text label associated with a node, containing its title and duration.

### 2.2. Paths
Paths are `<path>` elements within the SVG, styled based on their class:

-   **`.visible-path`**: The standard, thick line connecting two parent nodes within the same branch.
-   **`.secondary-path`**: A thinner, often dashed line connecting a secondary node to its parent.
-   **`.bridge-path`**: A special path, often styled with a gradient, that connects a node from one branch to a node in another, signifying a cross-disciplinary link.
-   **`.tie-path`**: A short, straight line that visually connects an `.anchor-node` to its corresponding `.parent-node`.

---

## 3. UI Controls and Modals

-   **`#edit-controls-container`**: The fixed-position container for the main editor UI. It contains the primary "Editor" toggle and a panel of sub-options.
-   **`#edit-options`**: The panel that appears when the editor is toggled, containing buttons for:
    -   Toggling Edit Mode
    -   Changing the Lock State (node dragging)
    -   Switching Path Style
    -   Adding new Branches or Nodes
-   **`#minimap-container`**: The vertical navigation bar on the right, allowing users to see an overview of all branches and click to scroll to them.
-   **`#info-modal`**: A generic modal window used to display the application's documentation and overview.
-   **`#node-editor`**: A modal containing a form to edit the details of a selected node (title, duration, icon).
-   **`#event-log`**: A diagnostic panel that slides up from the bottom to display a running log of application events and errors, intended for debugging.
