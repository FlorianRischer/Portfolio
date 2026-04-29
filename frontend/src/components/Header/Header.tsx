// Author: Florian Rischer
import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTransition } from '../PageTransition/TransitionContext';
import './Header.css';

const EMAIL = 'uxdesign@flo-rischer.de';
const LINKEDIN = 'https://www.linkedin.com/in/florian-rischer-b15329362/';

const Header = () => {
  const { navigateWithTransition } = useTransition();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleNavigation = (e: React.MouseEvent, to: string) => {
    e.preventDefault();
    setMenuOpen(false);
    navigateWithTransition(to);
  };

  const handleCopyEmail = useCallback(() => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__left">
          <a href="/home" className="header__logo" onClick={(e) => handleNavigation(e, '/home')}>
            Florian Rischer
          </a>
          <span className="header__subtitle">computer science and design student</span>
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
            <li className={`header__nav-item ${location.pathname === '/works' ? 'header__nav-item--active' : ''}`}>
              <a href="/works" onClick={(e) => handleNavigation(e, '/works')}>works</a>
            </li>
            <li className={`header__nav-item ${location.pathname === '/about' ? 'header__nav-item--active' : ''}`}>
              <a href="/about" onClick={(e) => handleNavigation(e, '/about')}>about</a>
            </li>
            <li className="header__nav-item">
              <button
                className={`header__nav-btn${copied ? ' header__nav-btn--copied' : ''}`}
                onClick={handleCopyEmail}
              >
                <span className="header__nav-btn-label header__nav-btn-label--default">email</span>
                <span className="header__nav-btn-label header__nav-btn-label--hover">copy email</span>
                <span className="header__nav-btn-label header__nav-btn-label--copied">copied!</span>
              </button>
            </li>
            <li className="header__nav-item header__nav-item--social">
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">in</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
