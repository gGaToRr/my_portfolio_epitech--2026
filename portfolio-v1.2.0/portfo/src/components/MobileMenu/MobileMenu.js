import { useLanguage } from '../../context/LanguageContext';
import { getNavLinks } from '../../data/navLinks';
import translations from '../../data/translations';
import closeIcon from '../../assets/icons/close.png';
import './MobileMenu.css';

function MobileMenu({ open, onClose }) {
    const { lang } = useLanguage();
    const t = translations[lang] || translations.en;
    const links = getNavLinks(lang);

    if (!open) return null;

    return (
        <div className="test-menu open">
            <div className="title-menu">
                <h2>{t.nav.menuTitle}</h2>
                <button type="button" onClick={onClose} className="croix" aria-label={t.nav.closeMenu}>
                    <img className="App-header-img" src={closeIcon} alt="" />
                </button>
            </div>
            <nav className="link">
                {links.map((link) => (
                    <a key={link.href} href={link.href} onClick={onClose}>
                        <button type="button">{link.name}</button>
                    </a>
                ))}
            </nav>
        </div>
    );
}

export default MobileMenu;
