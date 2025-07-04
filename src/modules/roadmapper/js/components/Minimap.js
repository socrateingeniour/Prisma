import { store } from '../store.js';

export class Minimap {
    constructor(container) {
        this.container = container;
        store.subscribe(() => this.render());
    }

    render() {
        const { branches } = store.getState();
        this.container.innerHTML = `
            <div id="minimap-container" class="${store.getState().ui.isMinimapVisible ? '' : 'hidden'}">
                <div class="minimap-header">Branches</div>
                <ul class="minimap-branch-list">
                    ${branches.map(branch => `
                        <li class="minimap-branch" data-branch-id="${branch.id}" style="--branch-color: ${branch.color}">
                            ${branch.title}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        this.addEventListeners();
    }

    addEventListeners() {
        this.container.querySelectorAll('.minimap-branch').forEach(branchEl => {
            branchEl.addEventListener('click', (e) => {
                const branchId = e.target.dataset.branchId;
                const targetNode = store.getState().nodes.find(n => n.branchId === branchId);
                if (targetNode) {
                    const { x, y } = targetNode.position;
                    store.setPanOffset({ x: -x + 200, y: -y + 200});
                }
            });
        });
    }
}
