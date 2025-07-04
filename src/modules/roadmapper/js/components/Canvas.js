import { store } from '../store.js';
import { themeManager } from '../ThemeManager.js';

export class Canvas {
    constructor(container) {
        this.container = container;
    }

    render() {
        const { nodes, connections, ui } = store.getState();

        this.container.innerHTML = `
            <div 
                id="canvas-scaler" 
                style="transform: scale(${ui.zoomLevel}) translate(${ui.panOffset.x}px, ${ui.panOffset.y}px); transform-origin: 0 0;"
            >
                <svg class="path-svg">
                    <g id="path-group"></g>
                </svg>
                <div id="node-container"></div>
            </div>
        `;

        this.drawNodes(nodes);
        this.drawPaths(connections);
        this.addNodeEventListeners(this.container.querySelector('#node-container'));
        this.addCanvasEventListeners();
    }

    drawNodes(nodes) {
        const nodeContainer = this.container.querySelector('#node-container');
        if (!nodeContainer) return;

        const { branches } = store.getState();
        const branchesById = Object.fromEntries(branches.map(b => [b.id, b]));

        const nodesHtml = nodes.map(node => {
            const nodeTypeClass = node.type === 'parent' ? 'parent-node' : 'secondary-node';
            const branch = branchesById[node.branchId];
            const nodeColor = branch ? branch.color : 'var(--color-accent-primary)';
            const iconClass = themeManager.getIcon(node.icon) || themeManager.getIcon('nodeDefault');

            // Position labels to the side
            const labelPosClass = node.position.x > (this.container.offsetWidth / 2) ? 'label-pos-left' : 'label-pos-right';

            return `
                <div 
                    class="roadmap-node" 
                    id="${node.id}" 
                    style="left: ${node.position.x}px; top: ${node.position.y}px;"
                >
                    <div class="node-content-wrapper">
                        <div class="node-label ${labelPosClass}">${node.title}</div>
                        <div class="${nodeTypeClass}" style="background-color: ${nodeColor};">
                            <i class="${iconClass}"></i>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        nodeContainer.innerHTML = nodesHtml;
        this.addNodeEventListeners(nodeContainer);
    }

    addNodeEventListeners(nodeContainer) {
        let activeNode = null;
        let offset = { x: 0, y: 0 };

        const onMouseDown = (e) => {
            const { viewMode } = store.getState();
            const nodeEl = e.target.closest('.roadmap-node');
            if (!nodeEl) return;

            const nodeId = nodeEl.id;

            if (viewMode === 'edit') {
                store.selectElement(nodeId, 'node');
                activeNode = nodeEl;
                const nodeState = store.getState().nodes.find(n => n.id === nodeId);

                offset.x = e.clientX - nodeState.position.x;
                offset.y = e.clientY - nodeState.position.y;

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            } else { // explore mode
                const event = new CustomEvent('show:nodeCard', { detail: { nodeId } });
                document.dispatchEvent(event);
            }
        };

        const onMouseMove = (e) => {
            if (!activeNode) return;

            const newPosition = {
                x: e.clientX - offset.x,
                y: e.clientY - offset.y
            };

            store.updateNodePosition(activeNode.id, newPosition);
        };

        const onMouseUp = () => {
            activeNode = null;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        nodeContainer.addEventListener('mousedown', onMouseDown);
    }

    addCanvasEventListeners() {
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            // Zoom functionality temporarily disabled as per user request.
        });
    }

    drawPaths(connections) {
        const pathGroup = this.container.querySelector('#path-group');
        if (!pathGroup) return;

        const { nodes } = store.getState();
        const nodesById = Object.fromEntries(nodes.map(n => [n.id, n]));

        const pathsHtml = connections.map(conn => {
            const sourceNode = nodesById[conn.source];
            const targetNode = nodesById[conn.target];

            if (!sourceNode || !targetNode) return '';

            const pathD = this.generatePath(
                sourceNode.position,
                targetNode.position,
                store.getState().ui.pathStyle
            );

            const pathClass = conn.type === 'main' ? 'visible-path' : 'secondary-path';

            return `<path d="${pathD}" class="${pathClass}" id="${conn.id}" />`;
        }).join('');

        pathGroup.innerHTML = pathsHtml;
    }

    generatePath(p1, p2, style = 'structured') {
        if (style === 'organic') {
            const midX = p1.x + (p2.x - p1.x) / 2;
            return `M${p1.x},${p1.y} C${midX},${p1.y} ${midX},${p2.y} ${p2.x},${p2.y}`;
        } else { // structured
            const midX = p1.x + (p2.x - p1.x) / 2;
            return `M${p1.x},${p1.y} L${midX},${p1.y} L${midX},${p2.y} L${p2.x},${p2.y}`;
        }
    }
}
