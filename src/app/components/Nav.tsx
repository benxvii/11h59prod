import { NavLink } from 'react-router-dom';
import { LOGO_URL, SITE } from '../../config/site';
import './Nav.css';

const LINKS = [
  { to: '/photo', label: 'Photo' },
  { to: '/prise-de-parole', label: 'Prise de parole' },
  { to: '/contact', label: 'Contact' },
];

/**
 * Navigation persistante affichée en haut de chaque page de section
 * (Photo, Prise de parole, Contact). Absente de la page d'entrée, qui
 * propose ses propres liens en grand format.
 */
export default function Nav() {
  return (
    <nav className="site-nav">
      <NavLink to="/" className="site-nav-home" aria-label="Retour à l'accueil">
        <img className="site-nav-logo" src={LOGO_URL} alt={SITE.title} />
      </NavLink>
      <div className="site-nav-links">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `site-nav-link${isActive ? ' is-active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
