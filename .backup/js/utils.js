/**
 * @file Utility functions for the roadmap application.
 * @description Contains helpers for data parsing, DOM manipulation, and visual effects.
 */

import { allBranches } from './state.js';
import { layoutConfig } from './config.js';

/**
 * Parses branch and node data from the hidden HTML data island.
 * @returns {{branches: Array<object>, nodes: Array<object>}} An object with arrays of branch and node data.
 */
export function parseNodesFromHTML() {
    const branches = Array.from(document.querySelectorAll('#roadmap-data .branch-data')).map(el => el.dataset);
    const nodes = Array.from(document.querySelectorAll('#roadmap-data .node-data')).map(el => {
        const data = el.dataset;
        const node = { 
            id: data.id, 
            type: data.type, 
            branch: data.branch, 
            title: data.title, 
            icon: data.icon, 
            duration: data.duration || null 
        };
        if (node.type === 'parent') { 
            node.y = parseInt(data.y, 10); 
        } else { 
            node.parentId = data.parentId; 
            node.offset = { 
                x: parseInt(data.offsetX, 10) || 0, 
                y: parseInt(data.offsetY, 10) || 0 
            }; 
        }
        return node;
    });
    return { branches, nodes };
}

/**
 * Looks up the color for a given branch ID.
 * @param {string} branchId - The ID of the branch.
 * @returns {string} The hex color code for the branch.
 */
export function getBranchColor(branchId) {
    const branch = allBranches.find(b => b.id === branchId);
    return branch ? branch.color : '#25d0a9'; // Default to mint color
}

/**
 * Creates and attaches a temporary particle burst effect to an element.
 * @param {HTMLElement} element - The DOM element to attach the particles to.
 * @param {string} color - The color of the particles.
 */
export function createParticleEffect(element, color) {
    const particles = document.createElement('div');
    particles.className = 'particles';
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.setProperty('--tx', `${Math.random() * 100 - 50}px`);
        particle.style.setProperty('--ty', `${Math.random() * 100 - 50}px`);
        particle.style.backgroundColor = color;
        particle.style.width = `${Math.random() * 6 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.animationDelay = `${Math.random() * 0.5}s`;
        particles.appendChild(particle);
    }
    element.appendChild(particles);
    setTimeout(() => particles.remove(), 2000);
}

/**
 * Generates the SVG path data string ('d' attribute) between two points.
 * @param {{x: number, y: number}} p1 - Start point.
 * @param {{x: number, y: number}} p2 - End point.
 * @param {'structured'|'organic'} style - The path style.
 * @returns {string} The SVG path data.
 */
export function generatePath(p1, p2, style) {
    if (style === 'organic') {
        const cp1 = { x: p1.x, y: p1.y + (p2.y - p1.y) / 2 };
        const cp2 = { x: p2.x, y: p2.y - (p2.y - p1.y) / 2 };
        return `M ${p1.x} ${p1.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`;
    }
    const mid_y = p1.y + (p2.y - p1.y) / 2;
    const x_dir = p2.x > p1.x ? 1 : -1;
    return `M ${p1.x} ${p1.y} L ${p1.x} ${mid_y - layoutConfig.cornerRadius} Q ${p1.x} ${mid_y}, ${p1.x + layoutConfig.cornerRadius * x_dir} ${mid_y} L ${p2.x - layoutConfig.cornerRadius * x_dir} ${mid_y} Q ${p2.x} ${mid_y}, ${p2.x} ${mid_y + layoutConfig.cornerRadius} L ${p2.x} ${p2.y}`;
}

/**
 * Creates or reuses a gradient for a bridge path between two branches.
 * @param {string} branch1Id - The source branch ID.
 * @param {string} branch2Id - The target branch ID.
 * @returns {string} The ID of the SVG gradient.
 */
export function createBridgeGradient(branch1Id, branch2Id) { /* Logic omitted for brevity */ return `bridge-${branch1Id}-${branch2Id}`; }