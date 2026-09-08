import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getNavLinks } from '../../data/navLinks';
import burgerIcon from '../../assets/icons/burger.png';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import './Header.css';

const SECTION_IDS = ['home', 'who', 'objectives', 'experiences', 'projects', 'epitech-projects', 'contact'];

function Header({ isMenuOpen, onOpenMenu, theme, onToggleTheme }) {
    const { lang, toggleLang } = useLanguage();
    const links = getNavLinks(lang);
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            let current = 'home';

            for (const id of SECTION_IDS) {
                const el = document.getElementById(id);
                if (el) {
                    const top = el.offsetTop - 160;
                    const height = el.offsetHeight;
                    if (scrollY >= top && scrollY < top + height) {
                        current = id;
                        break;
                    }
                }
            }

            // Fallback for bottom of page
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
                current = 'contact';
            }

            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (e, href) => {
        if (href.startsWith('#')) {
            const targetId = href.substring(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', href);
                setActiveSection(targetId);
            }
        }
    };

    return (
        <header className="App-header">
            <div className={`App-header-container ${isMenuOpen ? 'clicked' : ''}`}>
                <div className="App-header-top">
                    <h1>Pierre Untersinger</h1>
                    <div className="App-header-actions">
                        <LanguageToggle lang={lang} onToggle={toggleLang} />
                        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                    </div>
                </div>

                <nav className="link-pc">
                    {links.map((link) => {
                        const targetId = link.href.replace('#', '');
                        const isActive = activeSection === targetId;

                        return (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                            >
                                <button
                                    type="button"
                                    className={isActive ? 'is-active' : ''}
                                >
                                    {link.name}
                                </button>
                            </a>
                        );
                    })}
                </nav>

                <button type="button" onClick={onOpenMenu} className="hamburger-button" aria-label="Ouvrir le menu">
                    <img className="App-header-img" src={burgerIcon} alt="" />
                </button>
            </div>
        </header>
    );
}

export default Header;
