import { store } from '../store.js';
import { themeManager } from '../ThemeManager.js';

export class EditorToolbar {
    constructor(container) {
        this.container = container;
    }

    render() {
        const { ui } = store.getState();
        const editIcon = themeManager.getIcon('edit');
        const isNodeSelected = ui.selectedElement.type === 'node';
        const lockIcon = themeManager.getIcon(ui.lockState);
        const pathStyleIcon = themeManager.getIcon(ui.pathStyle);

        this.container.innerHTML = `
            <div id="edit-controls-container">
                <button id="edit-toggle" class="control-button ${ui.isEditorActive ? 'active' : ''}">
                    <i class="${editIcon}"></i>
                </button>
                <div id="edit-options" class="${ui.isEditorActive ? '' : 'hidden'}">
                    <button id="add-node" class="control-button" ${!isNodeSelected ? 'disabled' : ''}><i class="fas fa-plus"></i> Node</button>
                    <button id="add-branch" class="control-button" ${!isNodeSelected ? 'disabled' : ''}><i class="fas fa-code-branch"></i> Branch</button>
                    <button id="lock-state-toggle" class="control-button"><i class="${lockIcon}"></i></button>
                    <button id="path-style-toggle" class="control-button"><i class="${pathStyleIcon}"></i></button>
                    <button id="save-roadmap" class="control-button"><i class="fas fa-save"></i></button>
                    <button id="load-roadmap" class="control-button"><i class="fas fa-folder-open"></i></button>
                </div>
            </div>
        `;

        this.addEventListeners();
    }

    addEventListeners() {
        this.container.querySelector('#edit-toggle').addEventListener('click', () => {
            const { ui } = store.getState();
            store.toggleEditor(!ui.isEditorActive);
        });

        this.container.querySelector('#add-node').addEventListener('click', () => {
            const { selectedElement } = store.getState().ui;
            if (selectedElement.type === 'node') {
                const selectedNode = store.getState().nodes.find(n => n.id === selectedElement.id);
                store.addNodeToBranch(selectedNode.branchId, {
                    type: 'secondary',
                    position: { x: selectedNode.position.x + 150, y: selectedNode.position.y },
                    title: 'New Node',
                    icon: 'nodeDefault',
                    content: { brief: '', stats: {}, cards: [] }
                });
            }
        });

        this.container.querySelector('#add-branch').addEventListener('click', () => {
            store.addBranch({ title: 'New Branch', color: 'var(--color-branch-3)' });
        });

        this.container.querySelector('#lock-state-toggle').addEventListener('click', () => {
            store.toggleLockState();
        });

        this.container.querySelector('#path-style-toggle').addEventListener('click', () => {
            store.togglePathStyle();
        });

        this.container.querySelector('#save-roadmap').addEventListener('click', () => {
            const state = store.getState();
            localStorage.setItem('roadmapData', JSON.stringify(state));
            alert('Roadmap saved to local storage!');
        });

        this.container.querySelector('#load-roadmap').addEventListener('click', () => {
            const savedData = localStorage.getItem('roadmapData');
            if (savedData) {
                store.setState(JSON.parse(savedData));
                alert('Roadmap loaded from local storage!');
            } else {
                alert('No roadmap found in local storage.');
            }
        });
    }
}
