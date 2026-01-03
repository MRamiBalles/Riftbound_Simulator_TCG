import { useState, useCallback, useEffect } from 'react';

/**
 * useShake Hook
 * Provides a transient 'isShaking' state triggered by 'RIFTBOUND_SHAKE' events.
 * Used for camera shake effects during high-impact combat.
 */
export const useShake = (intensity: number = 5, duration: number = 500) => {
    const [isShaking, setIsShaking] = useState(false);

    const triggerShake = useCallback(() => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), duration);
    }, [duration]);

    useEffect(() => {
        const handleEvent = (e: any) => {
            const eventIntensity = e.detail?.intensity || intensity;
            triggerShake();
        };

        window.addEventListener('RIFTBOUND_SHAKE', handleEvent);
        return () => window.removeEventListener('RIFTBOUND_SHAKE', handleEvent);
    }, [intensity, triggerShake]);

    return { isShaking };
};
