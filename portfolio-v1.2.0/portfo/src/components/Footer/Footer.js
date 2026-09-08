import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import translations from '../../data/translations';
import './Footer.css';

const year = new Date().getFullYear();

function Footer() {
    const { lang } = useLanguage();
    const t = translations[lang] || translations.en;

    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                <div className="site-footer__brand">
                    <h3>Pierre Untersinger</h3>
                    <p>{t.footer.brandDesc}</p>
                </div>

                <nav className="site-footer__nav" aria-label="Navigation pied de page">
                    <a href="#who">{t.nav.who}</a>
                    <a href="#objectives">{t.nav.objectives}</a>
                    <a href="#experiences">{t.nav.experiences}</a>
                    <a href="#projects">{t.nav.projects}</a>
                    <a href="#epitech-projects">{t.nav.epitech}</a>
                    <a href="#contact">{t.nav.contact}</a>
                </nav>

                <div className="site-footer__socials">
                    <a
                        href="https://github.com/gGaToRr"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                    >
                        <FaGithub />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/pierre-untersinger-406685253/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                    >
                        <FaLinkedin />
                    </a>
                    <a
                        href="mailto:pierre.untersinger2@gmail.com"
                        aria-label="Email"
                    >
                        <FaEnvelope />
                    </a>
                </div>
            </div>

            <div className="site-footer__bottom">
                <span>{t.footer.copyright.replace('{year}', year)}</span>
                <span>{t.footer.builtWith}</span>
            </div>
        </footer>
    );
}

export default Footer;
