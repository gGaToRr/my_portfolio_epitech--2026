import { useEffect, useRef, useState } from 'react';

function useInView({ threshold = 0.15, rootMargin = '0px', once = true } = {}) {
    const ref = useRef(null);
    const [inView, setInView] = useState(() => {
        return typeof window === 'undefined' || !('IntersectionObserver' in window);
    });

    useEffect(() => {
        if (!('IntersectionObserver' in window)) {
            setInView(true);
            return;
        }

        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    if (once) observer.unobserve(entry.target);
                } else if (!once) {
                    setInView(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [threshold, rootMargin, once]);

    return [ref, inView];
}

export default useInView;
