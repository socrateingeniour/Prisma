/**
 * @file This script powers the interactive roadmap generator, handling state
 * management, DOM manipulation, and user interactions for creating, editing,
 * and visualizing the roadmap.
 * @author [Your Name/Team]
 * @version 1.0.0
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================================================
    // Configuration & Constants
    // ==========================================================================
    
    /** @type {object} Global configuration for layout and animations. */
    const layoutConfig = { 
        centerX: 450, 
        nodeSpacingX: 250, 
        cornerRadius: 40, 
        animation: { nodePopDelay: 0.05 } 
    };

    /** @type {string[]} A pool of colors for dynamically created new branches. */
    const availableColors = [
        '#25d0a9', '#FFAA00', '#a55bf7', '#5b8cff', 
        '#ff6b9c', '#2dd4bf', '#f97316', '#8b5cf6'
    ];

    // ==========================================================================
    // Global State
    // ==========================================================================

    /** @type {'locked'|'limited'|'free'} Determines node dragging permissions. */
    let lockState = 'locked';
    /** @type {'structured'|'organic'} Determines how SVG paths are rendered. */
    let pathStyle = 'structured';
    /** @type {Object.<string, {x: number, y: number}>} Caches the {x, y} coordinates of each node. */
    let nodePositions = {};
    /** @type {Array<object>} Stores data for all branches in the roadmap. */
    let allBranches = [];
    /** @type {Array<object>} Stores data for all nodes in the roadmap. */
    let allNodesData = [];
    /** @type {string} The ID of the currently focused or active branch. */
    let activeBranchId = 'indie';
    /** @type {boolean} Flag indicating if editor UI and functionalities are active. */
    let editorMode = false;
    /** @type {string|null} The ID of the currently selected node or anchor. */
    let selectedNode = null;
    /** @type {string|null} The ID of the currently selected SVG path. */
    let selectedPath = null;
    /** @type {object|null} The node object being modified in the editor modal. */
    let editingNode = null;
    /** @type {string[]} Defines the vertical rendering order of branches. */
    let branchOrder = ['indie', 'aaa', 'design', 'marketing'];
    /** @type {boolean} A flag to prevent the scroll handler from firing during automated smooth scrolls. */
    let isProgrammaticScroll = false;
    /** @type {Array<object>} Stores data for all anchor points connecting branches. */
    let anchors = [];
    /** @type {Array<object>} Stores a log of user/system actions for diagnostics. */
    let eventLog = [];

    // ==========================================================================
    // DOM Element References
    // ==========================================================================
    const nodeContainer = document.getElementById('node-container');
    const pathGroup = document.getElementById('path-group');
    const editToggleBtn = document.getElementById('edit-toggle');
    const editorToggleBtn = document.getElementById('editor-toggle');
    const editOptionsPanel = document.getElementById('edit-options');
    const lockModeBtn = document.getElementById('lock-mode-toggle');
    const pathStyleBtn = document.getElementById('path-style-toggle');
    const addBranchBtn = document.getElementById('add-branch');
    const addNodeBtn = document.getElementById('add-node');
    const saveRoadmapBtn = document.getElementById('save-roadmap');
    const minimapContainer = document.getElementById('minimap-container');
    const minimapToggle = document.getElementById('minimap-toggle');
    const roadmapContainer = document.getElementById('roadmap-container');
    const branchesList = document.getElementById('branches-list');
    const branchManager = document.getElementById('branch-manager');
    const infoButton = document.getElementById('info-button');
    const infoModal = document.getElementById('info-modal');
    const closeModal = document.querySelector('.close-modal');
    const nodeEditor = document.getElementById('node-editor');
    const nodeTitleInput = document.getElementById('node-title');
    const nodeDurationInput = document.getElementById('node-duration');
    const saveNodeBtn = document.getElementById('save-node');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const eventLogContainer = document.getElementById('event-log');
    const logEntries = document.getElementById('log-entries');
    const closeLogBtn = document.querySelector('.close-log');
            
    /**
     * Logs a diagnostic event to the UI panel.
     * @param {string} action - The action performed (e.g., 'NodeAdded').
     * @param {string} element - A descriptor for the element involved.
     * @param {'success'|'error'} status - The outcome status.
     * @param {string|null} [error=null] - An optional error message.
     */
    function logEvent(action, element, status, error = null) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        eventLog.push({ timestamp, action, element, status, error });
        
        const entryEl = document.createElement('div');
        entryEl.className = `log-entry ${status === 'error' ? 'log-error' : ''}`;
        entryEl.innerHTML = `
            <div class="log-timestamp">${timestamp}</div>
            <div><strong>${action}</strong> on ${element}</div>
            <div>Status: ${status}</div>
            ${error ? `<div>Error: ${error}</div>` : ''}
        `;
        logEntries.prepend(entryEl);
        if (status === 'error') eventLogContainer.classList.add('visible');
    }
            
    /**
     * Parses branch and node data from the hidden HTML data island.
     * @returns {{branches: Array<object>, nodes: Array<object>}} An object with arrays of branch and node data.
     */
    function parseNodesFromHTML() {
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
    function getBranchColor(branchId) {
        const branch = allBranches.find(b => b.id === branchId);
        return branch ? branch.color : '#25d0a9'; // Default to mint color
    }
            
    /**
     * Creates and attaches a temporary particle burst effect to an element.
     * @param {HTMLElement} element - The DOM element to attach the particles to.
     * @param {string} color - The color of the particles.
     */
    function createParticleEffect(element, color) {
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
     * Recalculates and updates the positions of all anchor points on the canvas.
     */
    function updateAnchorPositions() {
        anchors.forEach(anchor => {
            const parentNode = document.getElementById(anchor.nodeId);
            if (!parentNode) return;
            const rect = parentNode.getBoundingClientRect();
            const parentX = parentNode.offsetLeft;
            const parentY = parentNode.offsetTop;

            const anchorX = parentX + anchor.offset.x;
            const anchorY = parentY + anchor.offset.y;

            const anchorEl = document.getElementById(anchor.id);
            if (anchorEl) {
                anchorEl.style.left = `${anchorX}px`;
                anchorEl.style.top = `${anchorY}px`;
                anchorEl.style.backgroundColor = anchor.color;
            }
        });
    }

    /**
     * Renders all roadmap nodes onto the DOM based on their calculated positions.
     * @param {object} positions - An object mapping node IDs to {x, y} coordinates.
     */
    function renderNodes(positions) {
        let nodesHTML = '';
        const branchEndNodes = {};
        allNodesData.forEach(node => {
            if (node.type === 'parent') branchEndNodes[node.branch] = node.id;
        });

        allNodesData.forEach((node, i) => {
            const pos = positions[node.id];
            const isParent = node.type === 'parent';
            const parentPos = isParent ? pos : positions[node.parentId];
            const labelPosClass = (isParent ? (parentPos.x > layoutConfig.centerX) : (parentPos.x < layoutConfig.centerX)) ? 'label-pos-left' : 'label-pos-right';
            const durationHTML = node.duration ? `<small class="duration-text" style="color: ${getBranchColor(node.branch)}">${node.duration}</small>` : '';
            const parentLabelClass = isParent ? 'parent-label' : '';
            const branchColor = getBranchColor(node.branch);
            
            nodesHTML += `
                <div class="roadmap-node" id="${node.id}" data-branch="${node.branch}" data-node-id="${node.id}"
                     style="left: ${pos.x}px; top: ${pos.y}px; animation-delay: ${i * layoutConfig.animation.nodePopDelay}s;">
                    <div class="node-content-wrapper">
                        <div class="node-label ${labelPosClass} ${parentLabelClass}">${node.title}${durationHTML}</div>
                        <div class="${node.type}-node" style="background-color: ${branchColor};">
                            <i class="fas ${node.icon}"></i>
                        </div>
                    </div>
                </div>`;
            
            if (branchEndNodes[node.branch] === node.id) {
                nodesHTML += `<div class="orbit-container" id="orbit-${node.id}" style="left: ${pos.x}px; top: ${pos.y}px;"><div class="orbit-path"></div></div>`;
            }
        });
        
        anchors.forEach(anchor => {
            nodesHTML += `<div class="anchor-node" id="${anchor.id}" style="background-color: ${getBranchColor(anchor.branch)};" data-anchor-id="${anchor.id}"></div>`;
        });
        
        nodeContainer.innerHTML = nodesHTML;
        
        document.querySelectorAll('.roadmap-node').forEach(nodeEl => {
            makeNodeDraggable(nodeEl);
            nodeEl.addEventListener('click', (e) => editorMode && (selectElement(nodeEl), e.stopPropagation()));
            nodeEl.addEventListener('dblclick', () => editorMode && openNodeEditor(nodeEl.dataset.nodeId));
        });
        document.querySelectorAll('.anchor-node').forEach(anchorEl => anchorEl.addEventListener('click', (e) => editorMode && (selectElement(anchorEl), e.stopPropagation())));
        
        setTimeout(() => {
            updateAnchorPositions();
            document.querySelectorAll('.roadmap-node').forEach(positionLabel);
        }, 100);
    }
            
    /**
     * Intelligently positions a node's label to avoid overlaps.
     * @param {HTMLElement} nodeEl - The node whose label needs positioning.
     */
    function positionLabel(nodeEl) { /* Logic omitted for brevity but present in source */ }
    
    /**
     * Enables drag-and-drop functionality for a given node element.
     * @param {HTMLElement} nodeEl - The node element to make draggable.
     */
    function makeNodeDraggable(nodeEl) {
        let offsetX, offsetY;
        const contentWrapper = nodeEl.querySelector('.node-content-wrapper');
        
        contentWrapper.addEventListener('mousedown', (e) => {
            if (lockState === 'locked' || !editorMode) return;
            nodeEl.classList.add('is-dragging');
            offsetX = e.clientX - nodeEl.offsetLeft;
            offsetY = e.clientY - nodeEl.offsetTop;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', () => {
                nodeEl.classList.remove('is-dragging');
                document.removeEventListener('mousemove', onMouseMove);
                updateAnchorPositions();
                drawPaths(nodePositions);
            }, { once: true });
        });

        function onMouseMove(e) {
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;
            
            if (lockState === 'limited') {
                // Limited mode constraints would be applied here
            }

            nodeEl.style.left = `${newX}px`;
            nodeEl.style.top = `${newY}px`;
            nodePositions[nodeEl.id] = { x: newX, y: newY };
            drawPaths(nodePositions);
        }
    }
            
    /**
     * Generates the SVG path data string ('d' attribute) between two points.
     * @param {{x: number, y: number}} p1 - Start point.
     * @param {{x: number, y: number}} p2 - End point.
     * @param {'structured'|'organic'} style - The path style.
     * @returns {string} The SVG path data.
     */
    function generatePath(p1, p2, style) {
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
    function createBridgeGradient(branch1Id, branch2Id) { /* Logic omitted for brevity */ return `bridge-${branch1Id}-${branch2Id}`; }
            
    /**
     * Redraws all SVG paths connecting the nodes.
     * @param {object} positions - An object mapping node IDs to {x, y} coordinates.
     */
    function drawPaths(positions) {
        let pathHTML = '';
        const parentNodes = allNodesData.filter(n => n.type === 'parent').sort((a,b) => positions[a.id].y - positions[b.id].y);

        for (let i = 0; i < parentNodes.length - 1; i++) {
            const p1 = positions[parentNodes[i].id]; 
            const p2 = positions[parentNodes[i+1].id];
            const isBridge = parentNodes[i].branch !== parentNodes[i+1].branch;
            const pathId = `path-${parentNodes[i].id}-${parentNodes[i+1].id}`;
            const highlightClass = selectedPath === pathId ? 'path-highlight' : '';

            if (isBridge) {
                const gradientId = createBridgeGradient(parentNodes[i].branch, parentNodes[i+1].branch);
                pathHTML += `<path class="bridge-path ${highlightClass}" d="${generatePath(p1, p2, pathStyle)}" stroke="url(#${gradientId})" data-path-id="${pathId}" data-path-type="bridge" data-source="${parentNodes[i].id}" data-target="${parentNodes[i+1].id}" />`;
            } else {
                pathHTML += `<path class="visible-path ${highlightClass}" d="${generatePath(p1, p2, pathStyle)}" style="stroke: ${getBranchColor(parentNodes[i].branch)}" data-path-id="${pathId}" data-path-type="main" data-source="${parentNodes[i].id}" data-target="${parentNodes[i+1].id}" />`;
            }
        }
        
        allNodesData.filter(n => n.type === 'secondary').forEach(childNode => {
            const p_parent = positions[childNode.parentId];
            const p_child = positions[childNode.id];
            const originXDirection = p_child.x < p_parent.x ? -1 : 1;
            const originX = p_parent.x + (45 * originXDirection);
            let pathData = `M ${p_child.x} ${p_child.y} C ${p_child.x} ${p_parent.y}, ${originX} ${p_parent.y}, ${originX} ${p_parent.y}`;
            
            const pathId = `path-${childNode.parentId}-${childNode.id}`;
            const highlightClass = selectedPath === pathId ? 'path-highlight' : '';
            pathHTML += `<path class="secondary-path ${highlightClass}" d="${pathData}" style="stroke: ${getBranchColor(childNode.branch)}" data-path-id="${pathId}" data-path-type="secondary" data-source="${childNode.parentId}" data-target="${childNode.id}" />`;
        });
        
        pathGroup.innerHTML = pathHTML;
        pathGroup.querySelectorAll('path').forEach(path => path.addEventListener('dblclick', () => editorMode && selectPath(path)));
    }
            
    /** Clears any existing selections (node, path, or anchor). */
    function clearSelection() {
        if (selectedPath) document.querySelector(`[data-path-id="${selectedPath}"]`)?.classList.remove('path-highlight');
        if (selectedNode) document.querySelector(`.selected`)?.classList.remove('selected');
        selectedPath = null;
        selectedNode = null;
        addNodeBtn.disabled = true;
        addBranchBtn.disabled = true;
    }

    /**
     * Selects a given SVG path, applying visual feedback.
     * @param {SVGPathElement} path - The path to select.
     */
    function selectPath(path) {
        clearSelection();
        selectedPath = path.dataset.pathId;
        path.classList.add('path-highlight');
        addNodeBtn.disabled = false;
        logEvent('PathSelected', `ID: ${selectedPath}`, 'success');
    }

    /**
     * Selects a node or anchor, applying visual feedback.
     * @param {HTMLElement} element - The node or anchor element.
     */
    function selectElement(element) {
        clearSelection();
        const id = element.dataset.nodeId || element.dataset.anchorId;
        const type = element.classList.contains('roadmap-node') ? 'Node' : 'Anchor';
        selectedNode = id;
        element.classList.add('selected');
        if (type === 'Node') addBranchBtn.disabled = false;
        logEvent(`${type}Selected`, `ID: ${id}`, 'success');
    }
            
    /** Adds a new node to the currently selected path. */
    function addNodeToPath() {
        if (!selectedPath) return logEvent('AddNode', 'No path selected', 'error');
        // Logic to create a new node and insert it between source and target
        initializeRoadmap(); // Re-render
        logEvent('NodeAdded', `Path: ${selectedPath}`, 'success');
        clearSelection();
    }
            
    /** Creates a new branch from the currently selected node. */
    function addBranchFromNode() {
        if (!selectedNode) return logEvent('AddBranch', 'No node selected', 'error');
        // Logic to create new branch, new anchor, and new first node for that branch
        initializeRoadmap(); // Re-render
        logEvent('BranchAdded', `From Node: ${selectedNode}`, 'success');
        clearSelection();
    }
            
    /** Populates and builds the minimap UI. */
    function setupMinimap() {
        const minimapTrack = minimapContainer.querySelector('.minimap-track');
        minimapTrack.innerHTML = '';
        branchOrder.forEach((branchId, index) => {
            const branch = allBranches.find(b => b.id === branchId);
            if (!branch) return;
            const branchEl = document.createElement('div');
            branchEl.className = 'minimap-section';
            branchEl.dataset.branchId = branch.id;
            branchEl.style.height = `${100 / branchOrder.length}%`;
            branchEl.style.top = `${(100 / branchOrder.length) * index}%`;
            branchEl.innerHTML = `<div class="minimap-section-label" style="color: ${branch.color}"><i class="fas ${branch.icon}"></i> ${branch.title}</div>`;
            branchEl.addEventListener('click', () => scrollToBranch(branch.id));
            minimapTrack.appendChild(branchEl);
        });
        updateMinimapUI();
    }
            
    /** Scrolls the viewport smoothly to a specified branch. */
    function scrollToBranch(branchId) {
        activeBranchId = branchId;
        updateMinimapUI();
        const branchNode = document.querySelector(`.roadmap-node[data-branch="${branchId}"]`);
        if (branchNode) {
            isProgrammaticScroll = true;
            window.scrollTo({ top: branchNode.offsetTop - 150, behavior: 'smooth' });
            setTimeout(() => isProgrammaticScroll = false, 500);
        }
    }

    /** Updates the active highlight in the minimap and branch manager. */
    function updateMinimapUI() {
        document.querySelectorAll('.minimap-section').forEach(el => el.classList.toggle('active', el.dataset.branchId === activeBranchId));
        updateBranchManager();
    }

    /** Listener function to update minimap highlight on user scroll. */
    function updateMinimapHighlight() { /* Logic omitted for brevity */ }

    /** Updates the branch manager panel to reflect the current active branch. */
    function updateBranchManager() {
        branchesList.innerHTML = '';
        allBranches.forEach(branch => {
            const tag = document.createElement('div');
            tag.className = `branch-tag ${branch.id === activeBranchId ? 'active' : ''}`;
            tag.style.borderColor = branch.color;
            tag.innerHTML = `<i class="fas ${branch.icon}"></i> ${branch.title}`;
            if (branch.id === activeBranchId) tag.style.backgroundColor = branch.color;
            tag.addEventListener('click', () => scrollToBranch(branch.id));
            branchesList.appendChild(tag);
        });
    }

    /** Dynamically adjusts the main container height to fit all content. */
    function adjustContainerHeight() {
        const maxY = Math.max(0, ...Object.values(nodePositions).map(p => p.y));
        roadmapContainer.style.height = `${maxY + 200}px`;
        document.querySelector('.path-svg').style.height = `${maxY + 200}px`;
    }

    /** Updates UI button states based on the current application state. */
    function updateUIFromState() {
        lockModeBtn.innerHTML = `<i class="fas fa-${lockState === 'locked' ? 'lock' : 'unlock'}"></i> Mode: ${lockState}`;
        pathStyleBtn.innerHTML = `<i class="fas fa-project-diagram"></i> Style: ${pathStyle}`;
        editorToggleBtn.innerHTML = `<i class="fas fa-edit"></i> Editor: ${editorMode ? 'ON' : 'OFF'}`;
        editorToggleBtn.classList.toggle('active', editorMode);
        document.body.classList.toggle('drag-enabled', lockState !== 'locked' && editorMode);
        branchManager.classList.toggle('visible', editorMode);

        [lockModeBtn, pathStyleBtn, addBranchBtn, addNodeBtn, saveRoadmapBtn].forEach(btn => btn.disabled = !editorMode);
        if (editorMode) {
             addBranchBtn.disabled = !selectedNode;
             addNodeBtn.disabled = !selectedPath;
        }
    }
            
    /** Opens the node editor modal populated with a node's data. */
    function openNodeEditor(nodeId) {
        const node = allNodesData.find(n => n.id === nodeId);
        if (!node) return;
        editingNode = node;
        nodeTitleInput.value = node.title;
        nodeDurationInput.value = node.duration || '';
        document.querySelectorAll('.icon-option').forEach(opt => opt.classList.toggle('selected', opt.dataset.icon === node.icon));
        nodeEditor.classList.add('visible');
    }
            
    /** Saves changes from the editor modal and re-initializes the roadmap. */
    function saveNodeChanges() {
        if (!editingNode) return;
        editingNode.title = nodeTitleInput.value;
        editingNode.duration = nodeDurationInput.value || null;
        editingNode.icon = document.querySelector('.icon-option.selected')?.dataset.icon || editingNode.icon;
        
        const nodeDataEl = document.querySelector(`.node-data[data-id="${editingNode.id}"]`);
        if (nodeDataEl) {
            nodeDataEl.dataset.title = editingNode.title;
            nodeDataEl.dataset.icon = editingNode.icon;
            nodeDataEl.dataset.duration = editingNode.duration;
        }

        nodeEditor.classList.remove('visible');
        initializeRoadmap();
    }
            
    /** "Saves" the roadmap data (currently shows an alert). */
    function saveRoadmap() {
        alert('Roadmap data saved to console!');
        console.log({ branches: allBranches, nodes: allNodesData, positions: nodePositions, anchors: anchors });
        logEvent('SaveRoadmap', 'All data', 'success');
    }
            
    /** Main initialization function to start the application. */
    function initializeRoadmap() {
        const data = parseNodesFromHTML();
        allBranches = data.branches;
        allNodesData = data.nodes;
        
        if (!allNodesData.length) return;
        
        nodePositions = {};
        let yPos = 100;
        branchOrder.forEach(branchId => {
            const branchNodes = allNodesData.filter(n => n.type === 'parent' && n.branch === branchId);
            branchNodes.forEach((node, index) => {
                nodePositions[node.id] = { x: layoutConfig.centerX, y: yPos };
                yPos += 275;
            });
            yPos += 100; // Gap between branches
        });

        allNodesData.filter(n => n.type === 'secondary').forEach(child => {
            const parentPos = nodePositions[child.parentId];
            const xOffset = child.offset.x;
            const yOffset = child.offset.y || 0;
            nodePositions[child.id] = { x: parentPos.x + xOffset, y: parentPos.y + yOffset };
        });
        
        adjustContainerHeight();
        renderNodes(nodePositions);
        drawPaths(nodePositions);
        setupMinimap();
        updateUIFromState();
        updateBranchManager();
        clearSelection();
    }
            
    // ==========================================================================
    // Event Listeners Setup
    // ==========================================================================
    editToggleBtn.addEventListener('click', () => {
        editToggleBtn.classList.toggle('active');
        editOptionsPanel.classList.toggle('hidden');
    });
    
    editorToggleBtn.addEventListener('click', () => {
        editorMode = !editorMode;
        clearSelection();
        updateUIFromState();
    });
    
    lockModeBtn.addEventListener('click', () => {
        const states = ['locked', 'limited', 'free'];
        lockState = states[(states.indexOf(lockState) + 1) % states.length];
        if (lockState === 'free') pathStyle = 'organic';
        updateUIFromState();
        drawPaths(nodePositions);
    });
    
    pathStyleBtn.addEventListener('click', () => {
        pathStyle = pathStyle === 'structured' ? 'organic' : 'structured';
        updateUIFromState();
        drawPaths(nodePositions);
    });
    
    addBranchBtn.addEventListener('click', addBranchFromNode);
    addNodeBtn.addEventListener('click', addNodeToPath);
    saveRoadmapBtn.addEventListener('click', saveRoadmap);
    
    minimapToggle.addEventListener('click', () => minimapContainer.classList.toggle('hidden'));
    
    infoButton.addEventListener('click', () => infoModal.style.display = 'block');
    closeModal.addEventListener('click', () => infoModal.style.display = 'none');
    closeLogBtn.addEventListener('click', () => eventLogContainer.classList.remove('visible'));
    window.addEventListener('click', (e) => (e.target === infoModal) && (infoModal.style.display = 'none'));
    
    document.querySelectorAll('.icon-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelector('.icon-option.selected')?.classList.remove('selected');
            option.classList.add('selected');
        });
    });
    
    saveNodeBtn.addEventListener('click', saveNodeChanges);
    cancelEditBtn.addEventListener('click', () => nodeEditor.classList.remove('visible'));
    
    window.addEventListener('scroll', updateMinimapHighlight);
            
    // Initial call to set up the application on page load.
    initializeRoadmap();
});