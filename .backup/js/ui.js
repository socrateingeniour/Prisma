/**
 * @file UI management for the roadmap application.
 * @description Handles the logic for modals, panels, the minimap, and other UI components.
 */

import { eventLog, allBranches, activeBranchId, branchOrder, isProgrammaticScroll, nodePositions, lockState, pathStyle, editorMode, selectedNode, selectedPath, allNodesData, editingNode } from './state.js';
import { logEntries, eventLogContainer, minimapContainer, branchesList, roadmapContainer, lockModeBtn, pathStyleBtn, editorToggleBtn, branchManager, addBranchBtn, addNodeBtn, nodeTitleInput, nodeDurationInput, nodeEditor } from './dom.js';
import { initializeRoadmap } from './app.js';


/**
 * Logs a diagnostic event to the UI panel.
 * @param {string} action - The action performed (e.g., 'NodeAdded').
 * @param {string} element - A descriptor for the element involved.
 * @param {'success'|'error'} status - The outcome status.
 * @param {string|null} [error=null] - An optional error message.
 */
export function logEvent(action, element, status, error = null) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    eventLog.push({ timestamp, action, element, status, error });
    
    const entryEl = document.createElement('div');
    entryEl.className = `log-entry ${status === 'error' ? 'log-error' : ''}`;
    entryEl.innerHTML = `
        <div class="log-timestamp">${timestamp}</div>
        <div><strong>${action}</strong> on ${element}</div>
        <div>Status: ${status}</div>
        ${error ? `<div>Error: ${error}</div>` : ''}
    `;
    logEntries.prepend(entryEl);
    if (status === 'error') eventLogContainer.classList.add('visible');
}

/** Populates and builds the minimap UI. */
export function setupMinimap() {
    const minimapTrack = minimapContainer.querySelector('.minimap-track');
    minimapTrack.innerHTML = '';
    branchOrder.forEach((branchId, index) => {
        const branch = allBranches.find(b => b.id === branchId);
        if (!branch) return;
        const branchEl = document.createElement('div');
        branchEl.className = 'minimap-section';
        branchEl.dataset.branchId = branch.id;
        branchEl.style.height = `${100 / branchOrder.length}%`;
        branchEl.style.top = `${(100 / branchOrder.length) * index}%`;
        branchEl.innerHTML = `<div class="minimap-section-label" style="color: ${branch.color}"><i class="fas ${branch.icon}"></i> ${branch.title}</div>`;
        branchEl.addEventListener('click', () => scrollToBranch(branch.id));
        minimapTrack.appendChild(branchEl);
    });
    updateMinimapUI();
}

/** Scrolls the viewport smoothly to a specified branch. */
export function scrollToBranch(branchId) {
    activeBranchId = branchId;
    updateMinimapUI();
    const branchNode = document.querySelector(`.roadmap-node[data-branch="${branchId}"]`);
    if (branchNode) {
        isProgrammaticScroll = true;
        window.scrollTo({ top: branchNode.offsetTop - 150, behavior: 'smooth' });
        setTimeout(() => isProgrammaticScroll = false, 500);
    }
}

/** Updates the active highlight in the minimap and branch manager. */
export function updateMinimapUI() {
    document.querySelectorAll('.minimap-section').forEach(el => el.classList.toggle('active', el.dataset.branchId === activeBranchId));
    updateBranchManager();
}

/** Listener function to update minimap highlight on user scroll. */
export function updateMinimapHighlight() { /* Logic omitted for brevity */ }

/** Updates the branch manager panel to reflect the current active branch. */
export function updateBranchManager() {
    branchesList.innerHTML = '';
    allBranches.forEach(branch => {
        const tag = document.createElement('div');
        tag.className = `branch-tag ${branch.id === activeBranchId ? 'active' : ''}`;
        tag.style.borderColor = branch.color;
        tag.innerHTML = `<i class="fas ${branch.icon}"></i> ${branch.title}`;
        if (branch.id === activeBranchId) tag.style.backgroundColor = branch.color;
        tag.addEventListener('click', () => scrollToBranch(branch.id));
        branchesList.appendChild(tag);
    });
}

/** Dynamically adjusts the main container height to fit all content. */
export function adjustContainerHeight() {
    const maxY = Math.max(0, ...Object.values(nodePositions).map(p => p.y));
    roadmapContainer.style.height = `${maxY + 200}px`;
    document.querySelector('.path-svg').style.height = `${maxY + 200}px`;
}

/** Updates UI button states based on the current application state. */
export function updateUIFromState() {
    lockModeBtn.innerHTML = `<i class="fas fa-${lockState === 'locked' ? 'lock' : 'unlock'}"></i> Mode: ${lockState}`;
    pathStyleBtn.innerHTML = `<i class="fas fa-project-diagram"></i> Style: ${pathStyle}`;
    editorToggleBtn.innerHTML = `<i class="fas fa-edit"></i> Editor: ${editorMode ? 'ON' : 'OFF'}`;
    editorToggleBtn.classList.toggle('active', editorMode);
    document.body.classList.toggle('drag-enabled', lockState !== 'locked' && editorMode);
    branchManager.classList.toggle('visible', editorMode);

    [lockModeBtn, pathStyleBtn, addBranchBtn, addNodeBtn, saveRoadmapBtn].forEach(btn => btn.disabled = !editorMode);
    if (editorMode) {
         addBranchBtn.disabled = !selectedNode;
         addNodeBtn.disabled = !selectedPath;
    }
}

/** Opens the node editor modal populated with a node's data. */
export function openNodeEditor(nodeId) {
    const node = allNodesData.find(n => n.id === nodeId);
    if (!node) return;
    editingNode = node;
    nodeTitleInput.value = node.title;
    nodeDurationInput.value = node.duration || '';
    document.querySelectorAll('.icon-option').forEach(opt => opt.classList.toggle('selected', opt.dataset.icon === node.icon));
    nodeEditor.classList.add('visible');
}

/** Saves changes from the editor modal and re-initializes the roadmap. */
export function saveNodeChanges() {
    if (!editingNode) return;
    editingNode.title = nodeTitleInput.value;
    editingNode.duration = nodeDurationInput.value || null;
    editingNode.icon = document.querySelector('.icon-option.selected')?.dataset.icon || editingNode.icon;
    
    const nodeDataEl = document.querySelector(`.node-data[data-id="${editingNode.id}"]`);
    if (nodeDataEl) {
        nodeDataEl.dataset.title = editingNode.title;
        nodeDataEl.dataset.icon = editingNode.icon;
        nodeDataEl.dataset.duration = editingNode.duration;
    }

    nodeEditor.classList.remove('visible');
    initializeRoadmap();
}