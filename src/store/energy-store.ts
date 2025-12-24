import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EnergyState {
    energy: number;
    maxEnergy: number;
    lastRegenTime: number | null; // Timestamp
    nextRegenTime: number | null; // Timestamp for UI countdown

    useEnergy: (amount: number) => boolean;
    restoreEnergy: () => void;
    checkRegen: () => void;
}

const REGEN_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 Hours

export const useEnergyStore = create<EnergyState>()(
    persist(
        (set, get) => ({
            energy: 2,
            maxEnergy: 2,
            lastRegenTime: Date.now(),
            nextRegenTime: Date.now() + REGEN_INTERVAL_MS,

            useEnergy: (amount) => {
                const { energy, nextRegenTime } = get();
                if (energy >= amount) {
                    const newEnergy = energy - amount;
                    // If we were full and now aren't, start the timer
                    let newNextRegen = nextRegenTime;
                    if (energy === get().maxEnergy && newEnergy < get().maxEnergy) {
                        newNextRegen = Date.now() + REGEN_INTERVAL_MS;
                    }

                    set({
                        energy: newEnergy,
                        lastRegenTime: Date.now(), // update activity
                        nextRegenTime: newNextRegen
                    });
                    return true;
                }
                return false;
            },

            restoreEnergy: () => {
                // Debug/Admin function
                set({ energy: get().maxEnergy, nextRegenTime: null });
            },

            checkRegen: () => {
                const { energy, maxEnergy, nextRegenTime } = get();
                if (energy >= maxEnergy) return;

                const now = Date.now();
                if (nextRegenTime && now >= nextRegenTime) {
                    // Calculate how many intervals passed
                    const timePassed = now - (nextRegenTime - REGEN_INTERVAL_MS);
                    const energyGained = Math.floor(timePassed / REGEN_INTERVAL_MS);

                    if (energyGained > 0) {
                        const newEnergy = Math.min(maxEnergy, energy + energyGained);

                        // Calculate next regen target
                        let newNextRegen = null;
                        if (newEnergy < maxEnergy) {
                            // Time remainder
                            const remainder = timePassed % REGEN_INTERVAL_MS;
                            newNextRegen = now + (REGEN_INTERVAL_MS - remainder);
                        }

                        set({
                            energy: newEnergy,
                            lastRegenTime: now,
                            nextRegenTime: newNextRegen
                        });
                    }
                }
            }
        }),
        {
            name: 'hextech-energy-storage',
        }
    )
);
