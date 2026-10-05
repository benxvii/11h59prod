import { Link } from 'react-router-dom';
import Nav from './Nav';
import './SpeakingPage.css';

interface Offer {
  title: string;
  pitch: string;
  formats: string;
}

const OFFERS: Offer[] = [
  {
    title: 'Coaching devant la caméra',
    pitch: 'Vous devez parler en public ou face caméra\u00a0? Nos coachings sont faits pour vous.',
    formats: 'Séance individuelle, pack de plusieurs séances, session en entreprise ou en équipe.',
  },
  {
    title: 'Cours d\u2019éloquence',
    pitch: 'Vous devez prendre la parole en public ou animer des entretiens\u00a0? Nos formations d\u2019éloquence sont faites pour vous.',
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
