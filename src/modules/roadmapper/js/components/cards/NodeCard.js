export class NodeCard {
    constructor(node, displayState) {
        this.node = node;
        this.displayState = displayState;
    }

    render(subCardHtml = '') {
        const cardClasses = `node-card ${this.displayState}`;
        const positionStyle = this.displayState === 'peek' ? `left: ${this.node.position.x}px; top: ${this.node.position.y + 70}px;` : '';

        return `
            <div class="${cardClasses}" style="${positionStyle}">
                <div class="node-card-header">
                    <h3>${this.node.title}</h3>
                    <div class="card-controls">
                        ${this.displayState === 'docked' ? '<button class="expand-card"><i class="fas fa-expand"></i></button>' : ''}
                        ${this.displayState === 'fullscreen' ? '<button class="shrink-card"><i class="fas fa-compress"></i></button>' : ''}
                        <button class="close-card"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="node-card-content">
                    ${subCardHtml ? subCardHtml : `
                        <p>${this.node.content.brief}</p>
                        <div class="node-card-stats">
                            ${Object.entries(this.node.content.stats).map(([key, value]) => `
                                <div class="stat">
                                    <span class="stat-key">${key}:</span>
                                    <span class="stat-value">${value}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="node-card-actions">
                            ${this.node.content.cards.map(card => `
                                <button class="card-action-button" data-card-type="${card.type}" data-card-source="${card.data_source}">
                                    View ${card.type}
                                </button>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    }
}
