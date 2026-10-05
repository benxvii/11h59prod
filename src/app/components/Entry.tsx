import { Link } from 'react-router-dom';
import { LOGO_URL, SITE } from '../../config/site';
import './Entry.css';

const SECTIONS = [
  { to: '/photo', label: 'Photo' },
  { to: '/prise-de-parole', label: 'Prise de parole' },
  { to: '/contact', label: 'Contact' },
];

/**
 * Page d'entrée du site : juste le logo et les 3 portes d'entrée vers les
 * sections (Photo, Prise de parole, Contact). Pas de nav ici, les liens
 * sont la navigation.
 */
export default function Entry() {
  return (
    <div className="entry">
      <nav className="entry-links">
        {SECTIONS.map((section) => (
          <Link key={section.to} className="entry-link" to={section.to}>
            {section.label}
          </Link>
        ))}
      </nav>
      <img className="entry-logo" src={LOGO_URL} alt={SITE.title} />
    </div>
  );
}
