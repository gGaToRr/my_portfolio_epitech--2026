import { useState, useEffect } from 'react';
import { FaArrowDown, FaPaperPlane } from 'react-icons/fa';
import './Hero.css';

const ROLES = [
    "Étudiant à Epitech Marseille",
    "Passionné Réseau & Infra Cloud",
    "Développeur Fullstack & Maker",
    "Administrateur Système & Cyber",
];

function Hero() {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [blink, setBlink] = useState(true);

    // Effet curseur clignotant
    useEffect(() => {
        const timeout = setInterval(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearInterval(timeout);
    }, []);

    // Effet machine à écrire (Typing effect)
    useEffect(() => {
        if (subIndex === ROLES[index].length + 1 && !reverse) {
            const timeout = setTimeout(() => {
                setReverse(true);
            }, 1800);
            return () => clearTimeout(timeout);
        }

        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % ROLES.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, reverse ? 40 : 75);

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse]);

    return (
        <section id="home" className="hero-section">
            <div className="hero-content">
                <div className="hero-badge">
                    <span className="hero-badge-dot" />
                    <span>Portfolio interactif · Promo 2028</span>
                </div>

                <h1 className="hero-title">
                    <span className="hero-greeting">Bonjour, je suis</span>
                    <span className="hero-name">Pierre Untersinger</span>
                </h1>

                <div className="hero-typing-wrap">
                    <span className="hero-typing-prefix">❯</span>
                    <span className="hero-typing-text">
                        {ROLES[index].substring(0, subIndex)}
                    </span>
                    <span className={`hero-cursor ${blink ? 'is-visible' : ''}`}>|</span>
                </div>

                <p className="hero-description">
                    Étudiant passionné par les architectures réseau, le Cloud et la cybersécurité.
                    Je conçois des infrastructures fiables, des outils concrets et des applications modernes.
                </p>

                <div className="hero-actions">
                    <a href="#who" className="btn-hero btn-hero--primary">
                        Découvrir mon profil <FaArrowDown className="btn-icon" />
                    </a>
                    <a href="#contact" className="btn-hero btn-hero--ghost">
                        Me contacter <FaPaperPlane className="btn-icon" />
                    </a>
                </div>
            </div>

            <a href="#who" className="hero-scroll-indicator" aria-label="Défiler vers Who I am">
                <div className="mouse-wheel">
                    <span className="mouse-dot" />
                </div>
                <span className="scroll-text">Scroll</span>
            </a>
        </section>
    );
}

export default Hero;
