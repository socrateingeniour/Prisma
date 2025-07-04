import { store } from '../store.js';
import { themeManager } from '../ThemeManager.js';

export class ViewportToolbar {
    constructor(container) {
        this.container = container;
    }

    render() {
        const { ui } = store.getState();
        const zoomInIcon = themeManager.getIcon('zoomIn');
        const zoomOutIcon = themeManager.getIcon('zoomOut');
        const scrollZoomIcon = themeManager.getIcon('toggleScrollZoom');
        const scrollPanIcon = themeManager.getIcon('toggleScrollPan');
        const minimapIcon = themeManager.getIcon('minimap');

        this.container.innerHTML = `
            <div id="viewport-controls-container">
                <button id="zoom-in" class="control-button"><i class="${zoomInIcon}"></i></button>
                <span id="zoom-level">${Math.round(ui.zoomLevel * 100)}%</span>
                <button id="zoom-out" class="control-button"><i class="${zoomOutIcon}"></i></button>
                <button id="scroll-behavior-toggle" class="control-button">
                    <i class="${ui.scrollBehavior === 'zoom' ? scrollZoomIcon : scrollPanIcon}"></i>
                </button>
                <button id="minimap-toggle" class="control-button"><i class="${minimapIcon}"></i></button>
            </div>
        `;

        this.addEventListeners();
    }

    addEventListeners() {
        this.container.querySelector('#zoom-in').addEventListener('click', () => {
            store.setZoomLevel(store.getState().ui.zoomLevel + 0.1);
        });

        this.container.querySelector('#zoom-out').addEventListener('click', () => {
            store.setZoomLevel(store.getState().ui.zoomLevel - 0.1);
        });

        this.container.querySelector('#zoom-level').addEventListener('click', () => {
            store.setZoomLevel(1);
        });

        this.container.querySelector('#scroll-behavior-toggle').addEventListener('click', () => {
            store.toggleScrollBehavior();
        });

        this.container.querySelector('#minimap-toggle').addEventListener('click', () => {
            store.toggleMinimap();
        });
    }
}
