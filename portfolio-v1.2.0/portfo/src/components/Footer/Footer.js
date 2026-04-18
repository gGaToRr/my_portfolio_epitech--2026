import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

const year = new Date().getFullYear();

function Footer() {
    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                <div className="site-footer__brand">
                    <h3>Pierre Untersinger</h3>
                    <p>Étudiant Epitech Marseille — Développement & Infrastructures</p>
                </div>

                <nav className="site-footer__nav" aria-label="Navigation pied de page">
                    <a href="#who">Who I am</a>
                    <a href="#objectives">Objectives</a>
                    <a href="#experiences">Experiences</a>
                    <a href="#contact">Contact</a>
                </nav>

                <div className="site-footer__socials">
                    <a
                        href="https://github.com/"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="GitHub"
                    >
                        <FaGithub />
                    </a>
                    <a
                        href="https://linkedin.com/"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="LinkedIn"
                    >
                        <FaLinkedin />
                    </a>
                    <a href="mailto:contact@example.com" aria-label="Email">
                        <FaEnvelope />
                    </a>
                </div>
            </div>

            <div className="site-footer__bottom">
                <span>© {year} Pierre Untersinger. Tous droits réservés.</span>
                <span>Built with React · Vanta.js</span>
            </div>
        </footer>
    );
}

export default Footer;
