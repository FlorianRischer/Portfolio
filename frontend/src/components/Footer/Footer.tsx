import { Link } from 'react-router-dom';
import './Footer.css';

const EMAIL = 'uxdesign@flo-rischer.de';
const LINKEDIN = 'https://www.linkedin.com/in/florian-rischer-b15329362/';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__info">
          <span className="footer__name">Florian Rischer</span>
          <span className="footer__subtitle">Computer Science & Design — Hochschule München</span>
        </div>
        <div className="footer__links">
          <div className="footer__links-col">
            <a href={`mailto:${EMAIL}`} className="footer__link">{EMAIL}</a>
            <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="footer__link">LinkedIn</a>
          </div>
          <div className="footer__links-col">
            <Link to="/impressum" className="footer__link">Impressum</Link>
            <Link to="/datenschutz" className="footer__link">Datenschutz</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
