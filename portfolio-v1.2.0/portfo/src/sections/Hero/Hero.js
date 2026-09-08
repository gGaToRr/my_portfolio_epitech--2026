import { FaArrowDown, FaPaperPlane } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import translations from '../../data/translations';
import './Hero.css';

function Hero() {
    const { lang } = useLanguage();
    const t = translations[lang] || translations.en;

    return (
        <section id="home" className="hero-section">
            <div className="hero-content">
                <span className="hero-eyebrow">{t.hero.eyebrow}</span>

                <h1 className="hero-name">{t.hero.name}</h1>

                <p className="hero-tagline">
                    {t.hero.taglinePrefix} <strong>{t.hero.school}</strong>
                </p>

                <p className="hero-description">
                    {t.hero.description}
                </p>

                <div className="hero-actions">
                    <a href="#who" className="btn-hero btn-hero--primary">
                        {t.hero.btnProfile} <FaArrowDown className="btn-icon" />
                    </a>
                    <a href="#contact" className="btn-hero btn-hero--ghost">
                        {t.hero.btnContact} <FaPaperPlane className="btn-icon" />
                    </a>
                </div>
            </div>

            <a href="#who" className="hero-scroll-indicator" aria-label={t.hero.scroll}>
                <div className="mouse-wheel">
                    <span className="mouse-dot" />
                </div>
                <span className="scroll-text">{t.hero.scroll}</span>
            </a>
        </section>
    );
}

export default Hero;
