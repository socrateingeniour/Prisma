import { store } from '../store.js';
import { themeManager } from '../ThemeManager.js';

export class InfoPanel {
    constructor(container) {
        this.container = container;
        this.isVisible = false;
        this.activeTab = 'concepts'; // Default active tab
    }

    render() {
        const infoIcon = themeManager.getIcon('info');

        this.container.innerHTML = `
            <div id="info-modal" class="modal ${this.isVisible ? '' : 'hidden'}">
                <div class="modal-content">
                    <button class="close-modal"><i class="fas fa-times"></i></button>
                    <h2>Information <i class="${infoIcon}"></i></h2>
                    <div class="tabs">
                        <button class="tab-button ${this.activeTab === 'concepts' ? 'active' : ''}" data-tab="concepts">Concepts & Ideas</button>
                        <button class="tab-button ${this.activeTab === 'technical' ? 'active' : ''}" data-tab="technical">Technical Overview</button>
                        <button class="tab-button ${this.activeTab === 'code' ? 'active' : ''}" data-tab="code">Code & Issue Tracker</button>
                    </div>
                    <div class="tab-content">
                        ${this.getTabContent()}
                    </div>
                </div>
            </div>
        `;

        this.addEventListeners();
    }

    addEventListeners() {
        this.container.querySelector('.close-modal').addEventListener('click', () => {
            this.hide();
        });

        this.container.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.activeTab = e.target.dataset.tab;
                this.render();
            });
        });
    }

    getTabContent() {
        switch (this.activeTab) {
            case 'concepts':
                return `
                    <h3>Welcome to Roadmapper!</h3>
                    <p>This tool helps you visualize your academic and career paths. Click on nodes to see details, and use the editor to build your own roadmaps.</p>
                    <h4>Explore Mode:</h4>
                    <p>In explore mode, you can click on nodes to view detailed information cards about courses, colleges, or other milestones.</p>
                    <h4>Edit Mode:</h4>
                    <p>Toggle the editor to add new nodes, branches, and connections. You can also drag nodes to rearrange your roadmap.</p>
                `;
            case 'technical':
                return `
                    <h3>Technical Overview</h3>
                    <p>Roadmapper is built with vanilla JavaScript, HTML, and CSS, following a modular architecture.</p>
                    <h4>Key Components:</h4>
                    <ul>
                        <li><strong>Store:</strong> Centralized state management using the Observer pattern.</li>
                        <li><strong>ThemeManager:</strong> Handles dynamic theming and icon management.</li>
                        <li><strong>Repositories:</strong> Provides a clean API for data access (e.g., College and Course data).</li>
                        <li><strong>Canvas:</strong> Renders nodes and paths, handles drag-and-drop and zoom/pan interactions.</li>
                        <li><strong>CardManager:</strong> Orchestrates the display of interactive information cards.</li>
                    </ul>
                `;
            case 'code':
                return `
                    <h3>Code & Issue Tracker</h3>
                    <p>This section would typically link to internal documentation, issue tracking systems (e.g., Jira, GitHub Issues), or code repositories.</p>
                    <p>For development, check the browser's console for logs and errors.</p>
                `;
            default:
                return '';
        }
    }

    show() {
        this.isVisible = true;
        this.render();
    }

    hide() {
        this.isVisible = false;
        this.render();
    }
}
