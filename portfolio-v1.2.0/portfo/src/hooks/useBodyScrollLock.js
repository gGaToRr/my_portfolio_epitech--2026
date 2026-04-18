import { useEffect } from 'react';

export default function useBodyScrollLock(locked) {
    useEffect(() => {
        document.body.style.overflow = locked ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [locked]);
}
