/**
 * @file DOM rendering functions for the roadmap application.
 * @description Handles the creation and updating of nodes, paths, and other visual elements.
 */

import { allNodesData, anchors, selectedPath, editorMode } from './state.js';
import { layoutConfig } from './config.js';
import { getBranchColor, generatePath, createBridgeGradient } from './utils.js';
import { nodeContainer, pathGroup } from './dom.js';
import { makeNodeDraggable, selectElement, selectPath } from './events.js';
import { updateAnchorPositions, openNodeEditor } from './ui.js';

/**
 * Renders all roadmap nodes onto the DOM based on their calculated positions.
 * @param {object} positions - An object mapping node IDs to {x, y} coordinates.
 */
export function renderNodes(positions) {
    let nodesHTML = '';
    const branchEndNodes = {};
    allNodesData.forEach(node => {
        if (node.type === 'parent') branchEndNodes[node.branch] = node.id;
    });

    allNodesData.forEach((node, i) => {
        const pos = positions[node.id];
        const isParent = node.type === 'parent';
        const parentPos = isParent ? pos : positions[node.parentId];
        const labelPosClass = (isParent ? (parentPos.x > layoutConfig.centerX) : (parentPos.x < layoutConfig.centerX)) ? 'label-pos-left' : 'label-pos-right';
        const durationHTML = node.duration ? `<small class="duration-text" style="color: ${getBranchColor(node.branch)}">${node.duration}</small>` : '';
        const parentLabelClass = isParent ? 'parent-label' : '';
        const branchColor = getBranchColor(node.branch);
        
        nodesHTML += `
            <div class="roadmap-node" id="${node.id}" data-branch="${node.branch}" data-node-id="${node.id}"
                 style="left: ${pos.x}px; top: ${pos.y}px; animation-delay: ${i * layoutConfig.animation.nodePopDelay}s;">
                <div class="node-content-wrapper">
                    <div class="node-label ${labelPosClass} ${parentLabelClass}">${node.title}${durationHTML}</div>
                    <div class="${node.type}-node" style="background-color: ${branchColor};">
                        <i class="fas ${node.icon}"></i>
                    </div>
                </div>
            </div>`;
        
        if (branchEndNodes[node.branch] === node.id) {
            nodesHTML += `<div class="orbit-container" id="orbit-${node.id}" style="left: ${pos.x}px; top: ${pos.y}px;"><div class="orbit-path"></div></div>`;
        }
    });
    
    anchors.forEach(anchor => {
        nodesHTML += `<div class="anchor-node" id="${anchor.id}" style="background-color: ${getBranchColor(anchor.branch)};" data-anchor-id="${anchor.id}"></div>`;
    });
    
    nodeContainer.innerHTML = nodesHTML;
    
    document.querySelectorAll('.roadmap-node').forEach(nodeEl => {
        makeNodeDraggable(nodeEl);
        nodeEl.addEventListener('click', (e) => editorMode && (selectElement(nodeEl), e.stopPropagation()));
        nodeEl.addEventListener('dblclick', () => editorMode && openNodeEditor(nodeEl.dataset.nodeId));
    });
    document.querySelectorAll('.anchor-node').forEach(anchorEl => anchorEl.addEventListener('click', (e) => editorMode && (selectElement(anchorEl), e.stopPropagation())));
    
    setTimeout(() => {
        updateAnchorPositions();
        
    }, 100);
}

/**
 * Redraws all SVG paths connecting the nodes.
 * @param {object} positions - An object mapping node IDs to {x, y} coordinates.
 */
export function drawPaths(positions) {
    let pathHTML = '';
    const parentNodes = allNodesData.filter(n => n.type === 'parent').sort((a,b) => positions[a.id].y - positions[b.id].y);

    for (let i = 0; i < parentNodes.length - 1; i++) {
        const p1 = positions[parentNodes[i].id]; 
        const p2 = positions[parentNodes[i+1].id];
        const isBridge = parentNodes[i].branch !== parentNodes[i+1].branch;
        const pathId = `path-${parentNodes[i].id}-${parentNodes[i+1].id}`;
        const highlightClass = selectedPath === pathId ? 'path-highlight' : '';

        if (isBridge) {
            const gradientId = createBridgeGradient(parentNodes[i].branch, parentNodes[i+1].branch);
            pathHTML += `<path class="bridge-path ${highlightClass}" d="${generatePath(p1, p2, pathStyle)}" stroke="url(#${gradientId})" data-path-id="${pathId}" data-path-type="bridge" data-source="${parentNodes[i].id}" data-target="${parentNodes[i+1].id}" />`;
        } else {
            pathHTML += `<path class="visible-path ${highlightClass}" d="${generatePath(p1, p2, pathStyle)}" style="stroke: ${getBranchColor(parentNodes[i].branch)}" data-path-id="${pathId}" data-path-type="main" data-source="${parentNodes[i].id}" data-target="${parentNodes[i+1].id}" />`;
        }
    }
    
    allNodesData.filter(n => n.type === 'secondary').forEach(childNode => {
        const p_parent = positions[childNode.parentId];
        const p_child = positions[childNode.id];
        const originXDirection = p_child.x < p_parent.x ? -1 : 1;
        const originX = p_parent.x + (45 * originXDirection);
        let pathData = `M ${p_child.x} ${p_child.y} C ${p_child.x} ${p_parent.y}, ${originX} ${p_parent.y}, ${originX} ${p_parent.y}`;
        
        const pathId = `path-${childNode.parentId}-${childNode.id}`;
        const highlightClass = selectedPath === pathId ? 'path-highlight' : '';
        pathHTML += `<path class="secondary-path ${highlightClass}" d="${pathData}" style="stroke: ${getBranchColor(childNode.branch)}" data-path-id="${pathId}" data-path-type="secondary" data-source="${childNode.parentId}" data-target="${childNode.id}" />`;
    });
    
    pathGroup.innerHTML = pathHTML;
    pathGroup.querySelectorAll('path').forEach(path => path.addEventListener('dblclick', () => editorMode && selectPath(path)));
}