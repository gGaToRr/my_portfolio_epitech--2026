import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min';

const THEMES = {
    dark: {
        color: 0xa729de,
        backgroundColor: 0x0d1224,
    },
    light: {
        // inspiration Japon : fond crème blanc + lignes rose sakura / rouge torii
        color: 0xd2284c,
        backgroundColor: 0xfaf6f3,
    },
};

export default function useVantaBackground(theme = 'dark') {
    const bgRef = useRef(null);
    const effectRef = useRef(null);

    useEffect(() => {
        if (!bgRef.current) return;

        if (effectRef.current) {
            effectRef.current.destroy();
            effectRef.current = null;
        }

        const cfg = THEMES[theme] || THEMES.dark;

        effectRef.current = NET({
            el: bgRef.current,
            THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            maxDistance: 20.0,
            color: cfg.color,
            backgroundColor: cfg.backgroundColor,
            spacing: 20.0,
        });

        return () => {
            if (effectRef.current) {
                effectRef.current.destroy();
                effectRef.current = null;
            }
        };
    }, [theme]);

    return bgRef;
}
