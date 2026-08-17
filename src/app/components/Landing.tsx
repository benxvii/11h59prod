import { useEffect, useRef, useState } from 'react';
import {
  CLOUDINARY_RESOURCES_URL,
  EMAIL_HREF,
  IMAGE_ROTATION_INTERVAL_MS,
  PHONE_HREF,
  SITE,
} from '../../config/site';
import './Landing.css';

interface CloudinaryResource {
  secure_url: string;
}

interface CloudinaryResponse {
  resources: CloudinaryResource[];
}

/** Mélange un tableau (Fisher-Yates) sans muter l'original. */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Fait défiler une séquence d'images en fondu enchaîné (deux calques
 * superposés dont on alterne l'opacité) toutes les `intervalMs`.
 */
function useCrossfade(sequence: string[], intervalMs: number) {
  const [active, setActive] = useState<'a' | 'b'>('a');
  const [urlA, setUrlA] = useState<string | null>(null);
  const [urlB, setUrlB] = useState<string | null>(null);
  const sequenceRef = useRef<string[]>([]);
  const pointerRef = useRef(0);
  const activeRef = useRef<'a' | 'b'>('a');

  useEffect(() => {
    sequenceRef.current = sequence;
    if (sequence.length === 0) return;
    pointerRef.current = 0;
    activeRef.current = 'a';
    setActive('a');
    setUrlA(sequence[0]);
    setUrlB(null);
  }, [sequence]);

  useEffect(() => {
    if (sequence.length < 2) return undefined;

    const interval = setInterval(() => {
      const order = sequenceRef.current;
      const nextPointer = (pointerRef.current + 1) % order.length;
      const nextUrl = order[nextPointer];

      if (activeRef.current === 'a') {
        setUrlB(nextUrl);
        setActive('b');
        activeRef.current = 'b';
      } else {
        setUrlA(nextUrl);
        setActive('a');
        activeRef.current = 'a';
      }

      pointerRef.current = nextPointer;
    }, intervalMs);

    return () => clearInterval(interval);
  }, [sequence, intervalMs]);

  return { urlA, urlB, active };
}

function RotatingPhoto({ sequence }: { sequence: string[] }) {
  const { urlA, urlB, active } = useCrossfade(sequence, IMAGE_ROTATION_INTERVAL_MS);

  return (
    <div className="landing-photo">
      {urlA && (
        <div
          className={`landing-photo-layer ${active === 'a' ? 'is-visible' : ''}`}
          style={{ backgroundImage: `url(${urlA})` }}
        />
      )}
      {urlB && (
        <div
          className={`landing-photo-layer ${active === 'b' ? 'is-visible' : ''}`}
          style={{ backgroundImage: `url(${urlB})` }}
        />
      )}
    </div>
  );
}

export default function Landing() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadImages() {
      try {
        const response = await fetch(CLOUDINARY_RESOURCES_URL);
        const data: CloudinaryResponse = await response.json();
        const urls = (data.resources ?? []).map((res) => res.secure_url);
        if (cancelled || urls.length === 0) return;
        setImages(shuffle(urls));
      } catch (error) {
        console.error('Impossible de charger les images Cloudinary', error);
      }
    }

    loadImages();
    return () => {
      cancelled = true;
    };
  }, []);

  // Les deux photos piochent en alternance dans la même séquence mélangée,
  // pour ne jamais afficher deux fois la même image en même temps.
  const leftSequence = images.filter((_, index) => index % 2 === 0);
  const rightSequence = images.filter((_, index) => index % 2 === 1);

  return (
    <div className="landing">
      <div className="landing-photos">
        <RotatingPhoto sequence={leftSequence} />
        <RotatingPhoto sequence={rightSequence} />
      </div>

      <div className="landing-info">
        <div className="landing-block">
          <h1 className="landing-title">{SITE.title}</h1>
        </div>
        <div className="landing-block">
          <p className="landing-subtitle">{SITE.subtitle}</p>
        </div>
        <div className="landing-block">
          <a className="landing-contact" href={EMAIL_HREF}>
            {SITE.email}
          </a>
        </div>
        <div className="landing-block">
          <a className="landing-contact" href={PHONE_HREF}>
            {SITE.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
