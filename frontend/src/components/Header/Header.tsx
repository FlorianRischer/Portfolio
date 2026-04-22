// Author: Florian Rischer
import { useState } from 'react';
import { useTransition } from '../PageTransition/TransitionContext';
import './Header.css';

const Header = () => {
  const { navigateWithTransition } = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigation = (e: React.MouseEvent, to: string) => {
    e.preventDefault();
    setMenuOpen(false);
    navigateWithTransition(to);
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__left">
          <a href="/home" className="header__logo" onClick={(e) => handleNavigation(e, '/home')}>
            Florian Rischer
          </a>
          <span className="header__subtitle">ux ui design | frontend development | user research | service design</span>
        </div>

        <button
          className={`header__menu-btn ${menuOpen ? 'header__menu-btn--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span className="header__menu-line"></span>
          <span className="header__menu-line"></span>
          <span className="header__menu-line"></span>
        </button>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          <ul className="header__nav-list">
            <li className="header__nav-item">
              <a href="/works" onClick={(e) => handleNavigation(e, '/works')}>WORKS</a>
            </li>
            <li className="header__nav-item">
              <a href="/about" onClick={(e) => handleNavigation(e, '/about')}>ABOUT</a>
            </li>
            <li className="header__nav-item">
              <a href="/contact" onClick={(e) => handleNavigation(e, '/contact')}>CONTACT</a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="header__line"></div>
    </header>
  );
};

export default Header;
