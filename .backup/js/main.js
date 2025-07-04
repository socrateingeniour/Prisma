/**
 * @file Main entry point for the roadmap application.
 * @description Initializes the application, sets up event listeners, and orchestrates the overall functionality.
 */

import { layoutConfig, availableColors } from './config.js';
import { nodeContainer, pathGroup, editToggleBtn, editorToggleBtn, editOptionsPanel, lockModeBtn, pathStyleBtn, addBranchBtn, addNodeBtn, saveRoadmapBtn, minimapContainer, minimapToggle, roadmapContainer, branchesList, branchManager, infoButton, infoModal, closeModal, nodeEditor, nodeTitleInput, nodeDurationInput, saveNodeBtn, cancelEditBtn, eventLogContainer, logEntries, closeLogBtn } from './dom.js';
import { parseNodesFromHTML, getBranchColor, createParticleEffect, generatePath, createBridgeGradient } from './utils.js';
import { renderNodes, drawPaths } from './render.js';
import { makeNodeDraggable, clearSelection, selectPath, selectElement, addNodeToPath, addBranchFromNode, saveRoadmap } from './events.js';
import { logEvent, setupMinimap, scrollToBranch, updateMinimapUI, updateMinimapHighlight, updateBranchManager, adjustContainerHeight, updateUIFromState, openNodeEditor, saveNodeChanges } from './ui.js';
import { allBranches, allNodesData, lockState, pathStyle, nodePositions, activeBranchId, editorMode, selectedNode, selectedPath, editingNode, branchOrder, isProgrammaticScroll, anchors, eventLog } from './state.js';
import { initializeRoadmap } from './app.js';

// ==========================================================================
// Event Listeners Setup
// ==========================================================================
editToggleBtn.addEventListener('click', () => {
    editToggleBtn.classList.toggle('active');
    editOptionsPanel.classList.toggle('hidden');
});

editorToggleBtn.addEventListener('click', () => {
    editorMode = !editorMode;
    clearSelection();
    updateUIFromState();
});

lockModeBtn.addEventListener('click', () => {
    const states = ['locked', 'limited', 'free'];
    lockState = states[(states.indexOf(lockState) + 1) % states.length];
    if (lockState === 'free') pathStyle = 'organic';
    updateUIFromState();
    drawPaths(nodePositions);
});

pathStyleBtn.addEventListener('click', () => {
    pathStyle = pathStyle === 'structured' ? 'organic' : 'structured';
    updateUIFromState();
    drawPaths(nodePositions);
});

addBranchBtn.addEventListener('click', addBranchFromNode);
addNodeBtn.addEventListener('click', addNodeToPath);
saveRoadmapBtn.addEventListener('click', saveRoadmap);

minimapToggle.addEventListener('click', () => minimapContainer.classList.toggle('hidden'));

infoButton.addEventListener('click', () => infoModal.style.display = 'block');
closeModal.addEventListener('click', () => infoModal.style.display = 'none');
closeLogBtn.addEventListener('click', () => eventLogContainer.classList.remove('visible'));
window.addEventListener('click', (e) => (e.target === infoModal) && (infoModal.style.display = 'none'));

document.querySelectorAll('.icon-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelector('.icon-option.selected')?.classList.remove('selected');
        option.classList.add('selected');
    });
});

saveNodeBtn.addEventListener('click', saveNodeChanges);
cancelEditBtn.addEventListener('click', () => nodeEditor.classList.remove('visible'));

window.addEventListener('scroll', updateMinimapHighlight);
        
// Initial call to set up the application on page load.
initializeRoadmap();
