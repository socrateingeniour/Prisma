/**
 * @file Manages the global state for the roadmap application.
 * @description This includes variables for tracking UI state, roadmap data,
 * user selections, and configuration settings.
 */

// ==========================================================================
// Global State
// ==========================================================================

/** @type {'locked'|'limited'|'free'} Determines node dragging permissions. */
export let lockState = 'locked';
/** @type {'structured'|'organic'} Determines how SVG paths are rendered. */
export let pathStyle = 'structured';
/** @type {Object.<string, {x: number, y: number}>} Caches the {x, y} coordinates of each node. */
export let nodePositions = {};
/** @type {Array<object>} Stores data for all branches in the roadmap. */
export let allBranches = [];
/** @type {Array<object>} Stores data for all nodes in the roadmap. */
export let allNodesData = [];
/** @type {string} The ID of the currently focused or active branch. */
export let activeBranchId = 'indie';
/** @type {boolean} Flag indicating if editor UI and functionalities are active. */
export let editorMode = false;
/** @type {string|null} The ID of the currently selected node or anchor. */
export let selectedNode = null;
/** @type {string|null} The ID of the currently selected SVG path. */
export let selectedPath = null;
/** @type {object|null} The node object being modified in the editor modal. */
export let editingNode = null;
/** @type {string[]} Defines the vertical rendering order of branches. */
export let branchOrder = ['indie', 'aaa', 'design', 'marketing'];
/** @type {boolean} A flag to prevent the scroll handler from firing during automated smooth scrolls. */
export let isProgrammaticScroll = false;
/** @type {Array<object>} Stores data for all anchor points connecting branches. */
export let anchors = [];
/** @type {Array<object>} Stores a log of user/system actions for diagnostics. */
export let eventLog = [];
