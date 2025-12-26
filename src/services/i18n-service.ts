/**
 * Riftbound i18n Bridge
 * A lightweight localization manager for a global TCG audience.
 */
export type Locale = 'EN' | 'ES' | 'FR' | 'DE';

const TRANSLATIONS: Record<Locale, Record<string, string>> = {
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

export class I18nService {
    private static currentLocale: Locale = 'EN';

    public static t(key: string): string {
        return TRANSLATIONS[this.currentLocale][key] || key;
    }

    public static setLocale(locale: Locale) {
        this.currentLocale = locale;
    }

    public static getLocale(): Locale {
        return this.currentLocale;
    }
}
