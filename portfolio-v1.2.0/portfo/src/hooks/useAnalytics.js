import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackEvent } from '../services/api';

export function usePageViewTracker() {
    const location = useLocation();
    const lastPathRef = useRef(null);

    useEffect(() => {
        const currentPath = location.pathname + location.search;
        if (lastPathRef.current !== currentPath) {
            lastPathRef.current = currentPath;
            trackPageView(currentPath, document.referrer);
        }
    }, [location]);
}

export { trackEvent };
