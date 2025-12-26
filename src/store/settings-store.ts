import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    volume: number;
    isMuted: boolean;
    showAnimations: boolean;
    highQualityVFX: boolean;

    setVolume: (v: number) => void;
    toggleMute: () => void;
    setAnimations: (s: boolean) => void;
    setVFX: (s: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            volume: 0.5,
            isMuted: false,
            showAnimations: true,
            highQualityVFX: true,

            setVolume: (volume) => set({ volume }),
            toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
            setAnimations: (showAnimations) => set({ showAnimations }),
            setVFX: (highQualityVFX) => set({ highQualityVFX })
        }),
        {
            name: 'riftbound-settings',
        }
    )
);
