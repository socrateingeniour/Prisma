/**
 * @file Core application logic for the roadmap module.
 * @description Contains the main initialization function and orchestrates data loading and rendering.
 */

import { parseNodesFromHTML } from './utils.js';
import { renderNodes, drawPaths } from './render.js';
import { setupMinimap, updateUIFromState, updateBranchManager, adjustContainerHeight } from './ui.js';
import { clearSelection } from './events.js';
import { allBranches, allNodesData, nodePositions, branchOrder, lockState, pathStyle, editorMode, selectedNode, selectedPath, editingNode, isProgrammaticScroll, anchors, eventLog } from './state.js';
import { layoutConfig } from './config.js';

/** Main initialization function to start the application. */
export function initializeRoadmap() {
    const data = parseNodesFromHTML();
    allBranches = data.branches;
    allNodesData = data.nodes;
    
    if (!allNodesData.length) return;
    
    nodePositions = {};
    let yPos = 100;
    branchOrder.forEach(branchId => {
        const branchNodes = allNodesData.filter(n => n.type === 'parent' && n.branch === branchId);
        branchNodes.forEach((node, index) => {
            nodePositions[node.id] = { x: layoutConfig.centerX, y: yPos };
            yPos += 275;
        });
        yPos += 100; // Gap between branches
    });

    allNodesData.filter(n => n.type === 'secondary').forEach(child => {
        const parentPos = nodePositions[child.parentId];
        const xOffset = child.offset.x;
        const yOffset = child.offset.y || 0;
        nodePositions[child.id] = { x: parentPos.x + xOffset, y: parentPos.y + yOffset };
    });
    
    adjustContainerHeight();
    renderNodes(nodePositions);
    drawPaths(nodePositions);
    setupMinimap();
    updateUIFromState();
    updateBranchManager();
    clearSelection();
    }
