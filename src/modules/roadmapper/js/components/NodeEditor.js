import { store } from '../store.js';

export class NodeEditor {
    constructor(container) {
        this.container = container;
        this.isVisible = false;
        this.currentNode = null;
        store.subscribe(() => this.render());
    }

    render() {
        const { selectedElement, isEditorActive } = store.getState().ui;
        const { nodes } = store.getState();

        if (!isEditorActive || selectedElement.type !== 'node' || !this.isVisible) {
            this.container.innerHTML = '';
            return;
        }

        this.currentNode = nodes.find(n => n.id === selectedElement.id);
        if (!this.currentNode) {
            this.container.innerHTML = '';
            return;
        }

        this.container.innerHTML = `
            <div id="node-editor-modal" class="modal ${this.isVisible ? '' : 'hidden'}">
                <div class="modal-content">
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                    <h3>Edit Node: ${this.currentNode.title}</h3>
                    <form id="node-edit-form">
                        <div class="form-group">
                            <label for="node-title">Title:</label>
                            <input type="text" id="node-title" value="${this.currentNode.title}">
                        </div>
                        <div class="form-group">
                            <label for="node-brief">Brief:</label>
                            <textarea id="node-brief">${this.currentNode.content.brief}</textarea>
                        </div>
                        <button type="submit" class="save-button">Save Changes</button>
                    </form>
                </div>
            </div>
        `;

        this.addEventListeners();
    }

    addEventListeners() {
        this.container.querySelector('.close-modal').addEventListener('click', () => {
            this.hide();
        });

        this.container.querySelector('#node-edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = this.container.querySelector('#node-title').value;
            const brief = this.container.querySelector('#node-brief').value;
            store.updateNode({
                ...this.currentNode,
                title,
                content: { ...this.currentNode.content, brief }
            });
            this.hide();
        });
    }

    show() {
        this.isVisible = true;
        this.render();
    }

    hide() {
        this.isVisible = false;
        store.selectElement(null, null); // Deselect node when editor is closed
        this.render();
    }
}
