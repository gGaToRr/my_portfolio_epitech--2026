import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getNavLinks } from '../../data/navLinks';
import burgerIcon from '../../assets/icons/burger.png';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import './Header.css';

const SECTION_IDS = ['home', 'who', 'objectives', 'experiences', 'projects', 'epitech-projects', 'contact'];

function Header({
    isMenuOpen,
    onOpenMenu,
    theme,
    onToggleTheme,
    customLinks,
    activeId,
    onItemClick,
    title = "Pierre Untersinger",
    subtitle,
    footerNode,
}) {
    const { lang, toggleLang } = useLanguage();
    const defaultLinks = getNavLinks(lang);
    const links = customLinks || defaultLinks;
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        if (customLinks) return;

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
    }, [customLinks]);

    const handleNavClick = (e, link) => {
        if (customLinks) {
            if (link.onClick) {
                e.preventDefault();
                link.onClick();
            } else if (onItemClick) {
                e.preventDefault();
                onItemClick(link.id || link.href);
            }
            return;
        }

        const href = link.href || '';
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
                    <div>
                        <h1>{title}</h1>
                        {subtitle && (
                            <span style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.02em', display: 'block', marginTop: '4px' }}>
                                {subtitle}
                            </span>
                        )}
                    </div>
                    <div className="App-header-actions">
                        <LanguageToggle lang={lang} onToggle={toggleLang} />
                        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                    </div>
                </div>

                <nav className="link-pc">
                    {links.map((link) => {
                        const targetId = link.id || (link.href ? link.href.replace('#', '') : link.name);
                        const isActive = customLinks ? activeId === targetId : activeSection === targetId;

                        return (
                            <a
                                key={link.id || link.href || link.name}
                                href={link.href || '#'}
                                onClick={(e) => handleNavClick(e, link)}
                            >
                                <button
                                    type="button"
                                    className={isActive ? 'is-active' : ''}
                                >
                                    {link.icon && <span style={{ marginRight: '10px' }}>{link.icon}</span>}
                                    {link.name}
                                </button>
                            </a>
                        );
                    })}
                </nav>

                {footerNode && (
                    <div className="App-header-footer" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        {footerNode}
                    </div>
                )}

                <button type="button" onClick={onOpenMenu} className="hamburger-button" aria-label="Ouvrir le menu">
                    <img className="App-header-img" src={burgerIcon} alt="" />
                </button>
            </div>
        </header>
    );
}

export default Header;
