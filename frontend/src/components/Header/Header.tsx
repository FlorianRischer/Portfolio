// Author: Florian Rischer
import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useTransition } from '../PageTransition/TransitionContext';
import './Header.css';

const EMAIL = 'uxdesign@flo-rischer.de';
const LINKEDIN = 'https://www.linkedin.com/in/florian-rischer-b15329362/';

const Header = () => {
  const { navigateWithTransition } = useTransition();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const emailBtnRef = useRef<HTMLButtonElement>(null);
  const navListRef = useRef<HTMLUListElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const btn = emailBtnRef.current;
    const list = navListRef.current;
    if (!btn || !list) return;

    const items = Array.from(list.querySelectorAll<HTMLElement>('.header__nav-item'));
    const before = items.map((el) => el.getBoundingClientRect().left);

    const prevWidth = btn.offsetWidth;
    gsap.set(btn, { width: 'auto' });
    const targetWidth = btn.offsetWidth;

    const after = items.map((el) => el.getBoundingClientRect().left);

    gsap.set(btn, { width: prevWidth });
    items.forEach((el, i) => {
      const delta = before[i] - after[i];
      if (Math.abs(delta) > 0.5) {
        gsap.set(el, { x: delta });
      }
    });

    gsap.to(btn, { width: targetWidth, duration: 0.3, ease: 'power2.out', clearProps: 'width' });
    items.forEach((el) => {
      gsap.to(el, { x: 0, duration: 0.3, ease: 'power2.out', clearProps: 'x' });
    });
  }, [copied]);

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
          <ul ref={navListRef} className="header__nav-list">
            <li className={`header__nav-item ${location.pathname === '/works' ? 'header__nav-item--active' : ''}`}>
              <a href="/works" onClick={(e) => handleNavigation(e, '/works')}>works</a>
            </li>
            <li className={`header__nav-item ${location.pathname === '/about' ? 'header__nav-item--active' : ''}`}>
              <a href="/about" onClick={(e) => handleNavigation(e, '/about')}>about</a>
            </li>
            <li className="header__nav-item">
              <button ref={emailBtnRef} className="header__nav-btn" onClick={handleCopyEmail}>
                {copied ? 'copied!' : 'email'}
              </button>
            </li>
            <li className="header__nav-item">
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">in</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
