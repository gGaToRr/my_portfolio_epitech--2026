import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min';

export default function useVantaBackground() {
    const bgRef = useRef(null);
    const effectRef = useRef(null);

    useEffect(() => {
        if (!effectRef.current && bgRef.current) {
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
                color: 0xa729de,
                backgroundColor: 0xd1224,
                spacing: 20.0,
            });
        }
        return () => {
            if (effectRef.current) {
                effectRef.current.destroy();
                effectRef.current = null;
            }
        };
    }, []);

    return bgRef;
}
