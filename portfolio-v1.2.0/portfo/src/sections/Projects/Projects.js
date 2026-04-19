import { useEffect, useRef } from 'react';
import './Projects.css';

const projectLinks = [
    { label: 'Merci-Launcher', href: '#', size: 'lg' },
    { label: 'Merci Media', href: '#', size: 'lg' },
    { label: 'Serveur perso', href: '#', size: 'md' },
    { label: 'Portfolio v1', href: '#', size: 'md' },
    { label: 'Hackathon ISEN', href: '#', size: 'md' },
    { label: 'Bot Discord', href: '#', size: 'sm' },
    { label: 'Raytracer', href: '#', size: 'md' },
    { label: 'Shell 42', href: '#', size: 'sm' },
    { label: 'Dashboard', href: '#', size: 'sm' },
    { label: 'API Météo', href: '#', size: 'sm' },
    { label: 'Jeu Pygame', href: '#', size: 'md' },
    { label: 'Scraper', href: '#', size: 'sm' },
    { label: 'VPN maison', href: '#', size: 'sm' },
    { label: 'NAS self-host', href: '#', size: 'md' },
    { label: 'CI/CD perso', href: '#', size: 'sm' },
    { label: 'Site vitrine', href: '#', size: 'sm' },
    { label: 'Projet à venir', href: '#', size: 'sm' },
    { label: 'Projet à venir', href: '#', size: 'sm' },
    { label: 'Projet à venir', href: '#', size: 'sm' },
    { label: 'Projet à venir', href: '#', size: 'sm' },
];

function Projects() {
    const cloudRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0, active: false });

    useEffect(() => {
        const cloud = cloudRef.current;
        if (!cloud) return;

        const links = Array.from(cloud.querySelectorAll('.project-link'));
        const items = links.map((el, i) => ({
            el,
            ax: Math.random() * Math.PI * 2,
            ay: Math.random() * Math.PI * 2,
            sx: 0.4 + Math.random() * 0.6,
            sy: 0.4 + Math.random() * 0.6,
            ampX: 6 + Math.random() * 10,
            ampY: 4 + Math.random() * 8,
            phase: i * 0.25,
        }));

        const handleMove = (e) => {
            const rect = cloud.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left - rect.width / 2;
            mouseRef.current.y = e.clientY - rect.top - rect.height / 2;
            mouseRef.current.active = true;
        };
        const handleLeave = () => {
            mouseRef.current.active = false;
        };

        cloud.addEventListener('mousemove', handleMove);
        cloud.addEventListener('mouseleave', handleLeave);

        let raf;
        const start = performance.now();

        const tick = (now) => {
            const t = (now - start) / 1000;
            const m = mouseRef.current;

            items.forEach((it) => {
                const fx = Math.sin(t * it.sx + it.ax + it.phase) * it.ampX;
                const fy = Math.cos(t * it.sy + it.ay + it.phase) * it.ampY;

                let rx = 0, ry = 0;
                if (m.active) {
                    const rect = it.el.getBoundingClientRect();
                    const cRect = cloud.getBoundingClientRect();
                    const cx = rect.left - cRect.left + rect.width / 2 - cRect.width / 2;
                    const cy = rect.top - cRect.top + rect.height / 2 - cRect.height / 2;
                    const dx = cx - m.x;
                    const dy = cy - m.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const radius = 160;
                    if (dist < radius) {
                        const force = (1 - dist / radius) * 30;
                        rx = (dx / (dist || 1)) * force;
                        ry = (dy / (dist || 1)) * force;
                    }
                }

                it.el.style.transform = `translate(${fx + rx}px, ${fy + ry}px)`;
            });

            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            cloud.removeEventListener('mousemove', handleMove);
            cloud.removeEventListener('mouseleave', handleLeave);
        };
    }, []);

    return (
        <section id="projects">
            <h2>My projects</h2>
            <p className="projects-intro">
                Un nuage de liens vers mes projets — je le remplirai au fur et à mesure.
            </p>
            <div className="projects-cloud" ref={cloudRef}>
                {projectLinks.map((p, i) => (
                    <a
                        key={i}
                        href={p.href}
                        className={`project-link project-link--${p.size}`}
                    >
                        {p.label}
                    </a>
                ))}
            </div>
        </section>
    );
}

export default Projects;
