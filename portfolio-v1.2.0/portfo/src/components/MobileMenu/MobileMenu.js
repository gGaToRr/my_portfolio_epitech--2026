import { useLanguage } from '../../context/LanguageContext';
import { getNavLinks } from '../../data/navLinks';
import translations from '../../data/translations';
import closeIcon from '../../assets/icons/close.png';
import './MobileMenu.css';

function MobileMenu({
    open,
    onClose,
    customLinks,
    activeId,
    onItemClick,
    title,
    footerNode,
}) {
    const { lang } = useLanguage();
    const t = translations[lang] || translations.en;
    const defaultLinks = getNavLinks(lang);
    const links = customLinks || defaultLinks;

    if (!open) return null;

    const handleLinkClick = (e, link) => {
        if (customLinks) {
            if (link.onClick) {
                e.preventDefault();
                link.onClick();
            } else if (onItemClick) {
                e.preventDefault();
                onItemClick(link.id || link.href);
            }
            onClose();
            return;
        }

        onClose();
    };

    return (
        <div className="test-menu open">
            <div className="title-menu">
                <h2>{title || t.nav.menuTitle}</h2>
                <button type="button" onClick={onClose} className="croix" aria-label={t.nav.closeMenu}>
                    <img className="App-header-img" src={closeIcon} alt="" />
                </button>
            </div>
            <nav className="link">
                {links.map((link) => {
                    const targetId = link.id || (link.href ? link.href.replace('#', '') : link.name);
                    const isActive = customLinks ? activeId === targetId : false;

                    return (
                        <a
                            key={link.id || link.href || link.name}
                            href={link.href || '#'}
                            onClick={(e) => handleLinkClick(e, link)}
                        >
                            <button type="button" className={isActive ? 'is-active' : ''}>
                                {link.icon && <span style={{ marginRight: '10px' }}>{link.icon}</span>}
                                {link.name}
                            </button>
                        </a>
                    );
                })}
            </nav>
            {footerNode && (
                <div className="mobile-menu-footer">
                    {footerNode}
                </div>
            )}
        </div>
    );
}

export default MobileMenu;

