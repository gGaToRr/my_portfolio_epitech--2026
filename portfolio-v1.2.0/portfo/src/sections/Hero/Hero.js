import { FaArrowDown, FaPaperPlane } from 'react-icons/fa';
import './Hero.css';

function Hero() {
    return (
        <section id="home" className="hero-section">
            <div className="hero-content">
                <span className="hero-eyebrow">Bonjour, je suis</span>

                <h1 className="hero-name">Pierre Untersinger</h1>

                <p className="hero-tagline">
                    Étudiant en Ingénierie Informatique @ <strong>Epitech Marseille</strong>
                </p>

                <p className="hero-description">
                    Passionné par l'architecture réseau, l'administration système et le Cloud.
                    J'aime concevoir des infrastructures fiables, automatiser les environnements et développer des outils performants.
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

            <a href="#who" className="hero-scroll-indicator" aria-label="Défiler vers À propos">
                <div className="mouse-wheel">
                    <span className="mouse-dot" />
                </div>
                <span className="scroll-text">Découvrir</span>
            </a>
        </section>
    );
}

export default Hero;
