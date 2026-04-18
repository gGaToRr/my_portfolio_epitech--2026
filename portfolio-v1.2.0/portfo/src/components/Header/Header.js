import navLinks from '../../data/navLinks';
import burgerIcon from '../../assets/icons/burger.png';
import './Header.css';

function Header({ isMenuOpen, onOpenMenu }) {
    return (
        <header className="App-header">
            <div className={`App-header-container ${isMenuOpen ? 'clicked' : ''}`}>
                <h1>Pierre Untersinger</h1>

                <nav className="link-pc">
                    {navLinks.map((link) => (
                        <a key={link.href} href={link.href}>
                            <button type="button">{link.name}</button>
                        </a>
                    ))}
                </nav>

                <button type="button" onClick={onOpenMenu} className="hamburger-button" aria-label="Ouvrir le menu">
                    <img className="App-header-img" src={burgerIcon} alt="" />
                </button>
            </div>
        </header>
    );
}

export default Header;
