
const store = {
    _state: {
        nodes: [],
        connections: [],
        branches: [],
        ui: {
            isEditorActive: false,
            pathStyle: 'structured', // 'structured' or 'organic'
            lockState: 'locked', // 'locked', 'limited', 'free'
            selectedElement: { id: null, type: null },
            zoomLevel: 1,
            scrollBehavior: 'zoom', // 'zoom' or 'pan'
            panOffset: { x: 0, y: 0 },
            isMinimapVisible: true
        },
        viewMode: 'explore', // 'explore' or 'edit'
        activeCard: {
            nodeId: null,
            displayState: 'hidden', // 'hidden', 'peek', 'docked', 'fullscreen'
            activeSubCard: null
        }
    },
    _subscribers: [],

    getState() {
        return JSON.parse(JSON.stringify(this._state));
    },

    subscribe(callback) {
        this._subscribers.push(callback);
    },

    _notify() {
        this._subscribers.forEach(callback => callback());
    },

    selectElement(id, type) {
        this._state.ui.selectedElement = { id, type };
        this._notify();
    },

    // --- Mutations ---

    setState(newState) {
        this._state = { ...this._state, ...newState };
        this._notify();
    },

    addNode(nodeData) {
        this._state.nodes.push(nodeData);
        this._notify();
    },

    updateNodePosition(nodeId, newCoords) {
        const node = this._state.nodes.find(n => n.id === nodeId);
        if (node) {
            node.position = newCoords;
            this._notify();
        }
    },

    toggleEditor(isActive) {
        this._state.ui.isEditorActive = isActive;
        this.setViewMode(isActive ? 'edit' : 'explore');
        // Note: setViewMode will call notify, so we don't need to here.
    },

    setViewMode(mode) {
        this._state.viewMode = mode;
        this._notify();
    },

    showCardForNode(nodeId) {
        this._state.activeCard.nodeId = nodeId;
        this._state.activeCard.displayState = 'peek';
        this._notify();
    },

    setCardDisplayState(displayState) {
        this._state.activeCard.displayState = displayState;
        this._notify();
    },

    setActiveSubCard(subCard) {
        this._state.activeCard.activeSubCard = subCard;
        this._notify();
    },

    setZoomLevel(level) {
        this._state.ui.zoomLevel = Math.max(0.2, Math.min(level, 3)); // Clamp zoom between 20% and 300%
        this._notify();
    },

    toggleScrollBehavior() {
        this._state.ui.scrollBehavior = this._state.ui.scrollBehavior === 'zoom' ? 'pan' : 'zoom';
        this._notify();
    },

    setPanOffset(offset) {
        this._state.ui.panOffset = offset;
        this._notify();
    },

    toggleMinimap() {
        this._state.ui.isMinimapVisible = !this._state.ui.isMinimapVisible;
        this._notify();
    },

    addNodeToBranch(branchId, nodeData) {
        const newNode = {
            ...nodeData,
            id: `node-${Date.now()}`,
            branchId
        };
        this._state.nodes.push(newNode);
        this._notify();
    },

    addBranch(branchData) {
        const newBranch = {
            ...branchData,
            id: `branch-${Date.now()}`
        };
        this._state.branches.push(newBranch);
        this._notify();
    },

    updateNode(updatedNode) {
        const index = this._state.nodes.findIndex(n => n.id === updatedNode.id);
        if (index !== -1) {
            this._state.nodes[index] = updatedNode;
            this._notify();
        }
    },

    toggleLockState() {
        const lockStates = ['locked', 'limited', 'free'];
        const currentLockStateIndex = lockStates.indexOf(this._state.ui.lockState);
        this._state.ui.lockState = lockStates[(currentLockStateIndex + 1) % lockStates.length];
        this._notify();
    },

    togglePathStyle() {
        this._state.ui.pathStyle = this._state.ui.pathStyle === 'structured' ? 'organic' : 'structured';
        this._notify();
    }
};

export { store };
