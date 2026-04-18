import navLinks from '../../data/navLinks';
import closeIcon from '../../assets/icons/close.png';
import './MobileMenu.css';

function MobileMenu({ open, onClose }) {
    if (!open) return null;

    return (
        <div className="test-menu open">
            <div className="title-menu">
                <h2>Menu</h2>
                <button type="button" onClick={onClose} className="croix" aria-label="Fermer le menu">
                    <img className="App-header-img" src={closeIcon} alt="" />
                </button>
            </div>
            <nav className="link">
                {navLinks.map((link) => (
                    <a key={link.href} href={link.href} onClick={onClose}>
                        <button type="button">{link.name}</button>
                    </a>
                ))}
            </nav>
        </div>
    );
}

export default MobileMenu;
