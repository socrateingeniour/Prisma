/**
 * @file Global configuration for the roadmap application.
 * @description Contains constants for layout, animation, and theming.
 */

/** @type {object} Global configuration for layout and animations. */
export const layoutConfig = { 
    centerX: 450, 
    nodeSpacingX: 250, 
    cornerRadius: 40, 
    animation: { nodePopDelay: 0.05 } 
};

/** @type {string[]} A pool of colors for dynamically created new branches. */
export const availableColors = [
    '#25d0a9', '#FFAA00', '#a55bf7', '#5b8cff', 
    '#ff6b9c', '#2dd4bf', '#f97316', '#8b5cf6'
];
