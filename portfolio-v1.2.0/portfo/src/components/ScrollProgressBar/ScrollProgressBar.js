import { useEffect, useState } from 'react';
import './ScrollProgressBar.css';

function ScrollProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let ticking = false;

        const updateScrollProgress = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (scrollHeight > 0) {
                const percentage = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
                setProgress(percentage);
            }
            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        updateScrollProgress();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="scroll-progress-container" aria-hidden="true">
            <div
                className="scroll-progress-bar"
                style={{ transform: `scaleX(${progress / 100})` }}
            />
        </div>
    );
}

export default ScrollProgressBar;
