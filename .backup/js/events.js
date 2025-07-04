/**
 * @file Event handling for the roadmap application.
 * @description Manages all user interactions, including node dragging, selections, and button clicks.
 */

import { lockState, editorMode, nodePositions, selectedPath, selectedNode, allBranches, allNodesData, anchors } from './state.js';
import { addNodeBtn, addBranchBtn } from './dom.js';
import { updateAnchorPositions, logEvent } from './ui.js';
import { drawPaths } from './render.js';
import { initializeRoadmap } from './app.js';

/**
 * Enables drag-and-drop functionality for a given node element.
 * @param {HTMLElement} nodeEl - The node element to make draggable.
 */
export function makeNodeDraggable(nodeEl) {
    let offsetX, offsetY;
    const contentWrapper = nodeEl.querySelector('.node-content-wrapper');
    
    contentWrapper.addEventListener('mousedown', (e) => {
        if (lockState === 'locked' || !editorMode) return;
        nodeEl.classList.add('is-dragging');
        offsetX = e.clientX - nodeEl.offsetLeft;
        offsetY = e.clientY - nodeEl.offsetTop;
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', () => {
            nodeEl.classList.remove('is-dragging');
            document.removeEventListener('mousemove', onMouseMove);
            updateAnchorPositions();
            drawPaths(nodePositions);
        }, { once: true });
    });

    function onMouseMove(e) {
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;
        
        if (lockState === 'limited') {
            // Limited mode constraints would be applied here
        }

        nodeEl.style.left = `${newX}px`;
        nodeEl.style.top = `${newY}px`;
        nodePositions[nodeEl.id] = { x: newX, y: newY };
        drawPaths(nodePositions);
    }
}

/** Clears any existing selections (node, path, or anchor). */
export function clearSelection() {
    if (selectedPath) document.querySelector(`[data-path-id="${selectedPath}"]`)?.classList.remove('path-highlight');
    if (selectedNode) document.querySelector(`.selected`)?.classList.remove('selected');
    selectedPath = null;
    selectedNode = null;
    addNodeBtn.disabled = true;
    addBranchBtn.disabled = true;
}

/**
 * Selects a given SVG path, applying visual feedback.
 * @param {SVGPathElement} path - The path to select.
 */
export function selectPath(path) {
    clearSelection();
    selectedPath = path.dataset.pathId;
    path.classList.add('path-highlight');
    addNodeBtn.disabled = false;
    logEvent('PathSelected', `ID: ${selectedPath}`, 'success');
}

/**
 * Selects a node or anchor, applying visual feedback.
 * @param {HTMLElement} element - The node or anchor element.
 */
export function selectElement(element) {
    clearSelection();
    const id = element.dataset.nodeId || element.dataset.anchorId;
    const type = element.classList.contains('roadmap-node') ? 'Node' : 'Anchor';
    selectedNode = id;
    element.classList.add('selected');
    if (type === 'Node') addBranchBtn.disabled = false;
    logEvent(`${type}Selected`, `ID: ${id}`, 'success');
}

/** Adds a new node to the currently selected path. */
export function addNodeToPath() {
    if (!selectedPath) return logEvent('AddNode', 'No path selected', 'error');
    // Logic to create a new node and insert it between source and target
    initializeRoadmap(); // Re-render
    logEvent('NodeAdded', `Path: ${selectedPath}`, 'success');
    clearSelection();
}

/** Creates a new branch from the currently selected node. */
export function addBranchFromNode() {
    if (!selectedNode) return logEvent('AddBranch', 'No node selected', 'error');
    // Logic to create new branch, new anchor, and new first node for that branch
    initializeRoadmap(); // Re-render
    logEvent('BranchAdded', `From Node: ${selectedNode}`, 'success');
    clearSelection();
}

/** "Saves" the roadmap data (currently shows an alert). */
export function saveRoadmap() {
    alert('Roadmap data saved to console!');
    console.log({ branches: allBranches, nodes: allNodesData, positions: nodePositions, anchors: anchors });
    logEvent('SaveRoadmap', 'All data', 'success');
}