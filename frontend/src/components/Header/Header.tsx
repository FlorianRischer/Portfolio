// Author: Florian Rischer
import { useNavigate } from 'react-router-dom';
import { useTransition } from '../PageTransition/TransitionContext';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { navigateWithTransition } = useTransition();
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (e: React.MouseEvent, to: string) => {
    e.preventDefault();
    navigateWithTransition(to);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithTransition('/login');
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__left">
          <a href="/home" className="header__logo" onClick={(e) => handleNavigation(e, isAuthenticated ? '/home' : '/')}>
            Florian Rischer
          </a>
          <span className="header__subtitle">ux ui design | frontend development | user research</span>
        </div>

        <nav className="header__nav">
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
            <li className="header__nav-item header__nav-item--auth">
              {isAuthenticated ? (
                <button onClick={handleLogout} className="header__auth-btn">LOGOUT</button>
              ) : (
                <a href="/login" onClick={handleLogin} className="header__auth-link">LOGIN</a>
              )}
            </li>
          </ul>
        </nav>
      </div>
      <div className="header__line"></div>
    </header>
  );
};

export default Header;
