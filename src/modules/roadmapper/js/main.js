import { themeManager } from './ThemeManager.js';
import { store } from './store.js';
import { CollegeRepository } from './data/repositories/CollegeRepository.js';
import { CourseRepository } from './data/repositories/CourseRepository.js';
// Import UI components
import { Canvas } from './components/Canvas.js';
import { EditorToolbar } from './components/EditorToolbar.js';
import { ViewportToolbar } from './components/ViewportToolbar.js';
import { InfoPanel } from './components/InfoPanel.js';
import { Minimap } from './components/Minimap.js';
import { NodeEditor } from './components/NodeEditor.js';
import { CardManager } from './components/CardManager.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Systems
    await themeManager.loadTheme('dark-ocean');
    await CollegeRepository.initialize();
    await CourseRepository.initialize();

    // 2. Load Initial Data
    const savedData = localStorage.getItem('roadmapData');
    if (savedData) {
        store.setState(JSON.parse(savedData));
    } else {
        const initialData = parseDataFromHTML();
        store.setState(initialData);
    }

    // 3. Instantiate Components
    const canvas = new Canvas(document.getElementById('canvas-container'));
    // const editorToolbar = new EditorToolbar(document.getElementById('editor-toolbar-container'));
    // const viewportToolbar = new ViewportToolbar(document.getElementById('viewport-toolbar-container'));
    // const infoPanel = new InfoPanel(document.getElementById('info-panel-container'));
    // const minimap = new Minimap(document.getElementById('minimap-container'));
    // const nodeEditor = new NodeEditor(document.getElementById('node-editor-container'));
    // const cardManager = new CardManager(document.getElementById('card-manager-container'));

    // 4. Render & Mount
    canvas.render();
    // editorToolbar.render();
    // viewportToolbar.render();
    // infoPanel.render();
    // minimap.render();
    // nodeEditor.render();
    // cardManager.render();

    // 5. Establish Reactivity
    store.subscribe(() => {
        canvas.render();
        // editorToolbar.render();
        // viewportToolbar.render();
        // cardManager.render();
        // ... and so on for other components that need to react to state changes
    });

    // Example of component-to-component communication
    document.addEventListener('show:infoPanel', () => {
        infoPanel.show();
    });

    document.addEventListener('show:nodeCard', (e) => {
        store.showCardForNode(e.detail.nodeId);
    });
});

function parseDataFromHTML() {
    const nodes = [];
    document.querySelectorAll('.node-data').forEach(el => {
        const data = el.dataset;
        nodes.push({
            id: data.id,
            branchId: data.branchId,
            type: data.type,
            position: { x: parseInt(data.x, 10), y: parseInt(data.y, 10) },
            title: data.title,
            icon: data.icon,
            content: {
                brief: data.brief,
                stats: JSON.parse(data.stats || '{}'),
                cards: JSON.parse(data.cards || '[]')
            }
        });
    });

    const connections = [];
    document.querySelectorAll('.connection-data').forEach(el => {
        const data = el.dataset;
        connections.push({
            id: data.id,
            type: data.type,
            source: data.source,
            target: data.target
        });
    });

    const branches = [];
    document.querySelectorAll('.branch-data').forEach(el => {
        const data = el.dataset;
        branches.push({
            id: data.id,
            title: data.title,
            color: data.color
        });
    });

    return { nodes, connections, branches };
}
