"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nService = void 0;
const TRANSLATIONS = {
    EN: {
        APP_TITLE: "Riftbound Simulator",
        PLAY_MODE: "Enter the Rift",
        BUILD_MODE: "Forge Deck",
        DRAFT_MODE: "Expeditions",
        SETTINGS: "Nexus Config",
        AI_THINKING: "Neural Link Active...",
        WINNER: "VICTORY",
        LOSER: "DEFEAT"
    },
    ES: {
        APP_TITLE: "Simulador Riftbound",
        PLAY_MODE: "Entrar en el Nexo",
        BUILD_MODE: "Forjar Mazo",
        DRAFT_MODE: "Expediciones",
        SETTINGS: "Configuración",
        AI_THINKING: "Enlace Neuronal...",
        WINNER: "VICTORIA",
        LOSER: "DERROTA"
    },
    FR: {
        APP_TITLE: "Simulateur Riftbound",
        PLAY_MODE: "Entrer dans la Faille",
        BUILD_MODE: "Forger un deck",
        DRAFT_MODE: "Expéditions",
        SETTINGS: "Configuration",
        AI_THINKING: "Lien Neural...",
        WINNER: "VICTOIRE",
        LOSER: "DÉFAITE"
    },
    DE: {
        APP_TITLE: "Riftbound Simulator",
        PLAY_MODE: "Betrete den Riss",
        BUILD_MODE: "Deck Schmieden",
        DRAFT_MODE: "Expeditionen",
        SETTINGS: "Nexus-Konfig",
        AI_THINKING: "Neuraler Link...",
        WINNER: "SIEG",
        LOSER: "NIEDERLAGE"
    }
};
class I18nService {
    static currentLocale = 'EN';
    static t(key) {
        return TRANSLATIONS[this.currentLocale][key] || key;
    }
    static setLocale(locale) {
        this.currentLocale = locale;
    }
    static getLocale() {
        return this.currentLocale;
    }
}
exports.I18nService = I18nService;
