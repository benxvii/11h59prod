import { useState, type FormEvent } from 'react';
import { EMAIL_HREF, PHONE_HREF, SITE } from '../../config/site';
import Nav from './Nav';
import './ContactPage.css';

/**
 * Formulaire "front uniquement" : pas de backend pour l'instant (site
 * statique). La soumission ouvre le client mail de l'utilisateur avec le
 * sujet et le message pré-remplis, à envoyer lui-même vers `SITE.email`.
 */
export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = `Contact depuis le site \u2014 ${name || 'Sans nom'}`;
    const body = [`De : ${name} (${email})`, '', message].join('\n');

    const mailto = `${EMAIL_HREF}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  return (
    <div className="contact-page">
      <Nav />
      <div className="contact-page-content">
        <h1 className="contact-page-title">Contact</h1>

        <div className="contact-page-direct">
          <a className="contact-page-link" href={EMAIL_HREF}>
            {SITE.email}
          </a>
          <a className="contact-page-link" href={PHONE_HREF}>
            {SITE.phone}
          </a>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label className="contact-form-field">
            <span>Nom</span>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label className="contact-form-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="contact-form-field">
            <span>Message</span>
            <textarea
              name="message"
              rows={6}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
            />
          </label>

          <button className="contact-form-submit" type="submit">
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}
