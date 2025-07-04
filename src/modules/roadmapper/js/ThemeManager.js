class ThemeManager {
    constructor() {
        this.activeTheme = null;
    }

    async loadTheme(themeName) {
        try {
            const response = await fetch(`themes/${themeName}.theme.json`);
            if (!response.ok) {
                throw new Error(`Failed to load theme: ${themeName}`);
            }
            this.activeTheme = await response.json();
            document.body.dataset.theme = themeName;
            this.updateCSSVariables();
        } catch (error) {
            console.error("Theme loading error:", error);
        }
    }

    updateCSSVariables() {
        if (!this.activeTheme) return;

        // Set font variables
        document.documentElement.style.setProperty('--font-family-body', this.activeTheme.fonts.body);
        document.documentElement.style.setProperty('--font-family-header', this.activeTheme.fonts.header);
    }

    getIcon(role) {
        if (this.activeTheme && this.activeTheme.icons.map[role]) {
            return this.activeTheme.icons.map[role];
        }
        return 'fas fa-question-circle'; // Default icon
    }

    isEffectEnabled(effectName) {
        return this.activeTheme && this.activeTheme.effects[effectName];
    }
}

export const themeManager = new ThemeManager();
