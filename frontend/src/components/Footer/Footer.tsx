// Author: Florian Rischer
import { useTransition } from '../PageTransition/TransitionContext';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { navigateWithTransition } = useTransition();

  const handleNavigation = (e: React.MouseEvent, to: string) => {
    e.preventDefault();
    navigateWithTransition(to);
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="#home" className="footer__logo">Portfolio</a>
            <p className="footer__tagline">
              Kreatives Design trifft technische Exzellenz
            </p>
          </div>
          
          <div className="footer__links">
            <div className="footer__links-group">
              <h4>Navigation</h4>
              <ul>
                <li><a href="/" onClick={(e) => handleNavigation(e, '/')}>Home</a></li>
                <li><a href="/about" onClick={(e) => handleNavigation(e, '/about')}>About</a></li>
                <li><a href="/works" onClick={(e) => handleNavigation(e, '/works')}>Works</a></li>
                <li><a href="/contact" onClick={(e) => handleNavigation(e, '/contact')}>Contact</a></li>
              </ul>
            </div>
            
            <div className="footer__links-group">
              <h4>Social</h4>
              <ul>
                <li><a href="#" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                <li><a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                <li><a href="#" target="_blank" rel="noopener noreferrer">Twitter</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer__bottom">
          <p className="footer__copyright">
            © {currentYear} Florian. Alle Rechte vorbehalten.
          </p>
          <p className="footer__tech">
            Erstellt mit React & TypeScript
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
