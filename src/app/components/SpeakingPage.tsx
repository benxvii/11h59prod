import { Link } from 'react-router-dom';
import Nav from './Nav';
import './SpeakingPage.css';

interface Offer {
  title: string;
  pitch: string;
  clients: string;
  formats: string;
}

const OFFERS: Offer[] = [
  {
    title: 'Coaching devant la caméra',
    pitch: 'Vous vendez de l\u2019aisance et de la crédibilité à l\u2019image.',
    clients: 'Dirigeants, entrepreneurs, créateurs de contenu, experts qui font des vidéos, des interviews ou des webinaires.',
    formats: 'Séance individuelle, pack de plusieurs séances, session en entreprise ou en équipe.',
  },
  {
    title: 'Cours d\u2019éloquence',
    pitch: 'Vous vendez la confiance et l\u2019impact à l\u2019oral : prise de parole en public, pitch, présentations, entretiens.',
    clients: 'Particuliers, étudiants, professionnels, entreprises.',
    formats: 'Cours particuliers, ateliers collectifs, formation en entreprise.',
  },
];

export default function SpeakingPage() {
  return (
    <div className="speaking-page">
      <Nav />
      <div className="speaking-page-content">
        <h1 className="speaking-page-title">Prise de parole</h1>

        <div className="speaking-offers">
          {OFFERS.map((offer) => (
            <section className="speaking-offer" key={offer.title}>
              <h2 className="speaking-offer-title">{offer.title}</h2>
              <p className="speaking-offer-pitch">{offer.pitch}</p>
              <dl className="speaking-offer-details">
                <div className="speaking-offer-detail">
                  <dt>Clients</dt>
                  <dd>{offer.clients}</dd>
                </div>
                <div className="speaking-offer-detail">
                  <dt>Formats</dt>
                  <dd>{offer.formats}</dd>
                </div>
              </dl>
            </section>
          ))}
        </div>

        <Link className="speaking-page-cta" to="/contact">
          Prendre contact
        </Link>
      </div>
    </div>
  );
}
