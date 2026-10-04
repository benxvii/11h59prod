import { useEffect, useRef, useState } from 'react';
import {
  EMAIL_HREF,
  IMAGE_ROTATION_INTERVAL_MS,
  IMAGES_MANIFEST_URL,
  PHONE_HREF,
  SITE,
} from '../../config/site';
import './Landing.css';

type Pair = [string, string];

interface ImageGroup {
  folder: string;
  /**
   * Paires gauche/droite déjà formées par le script de génération du
   * manifest, d'après la convention de nommage des fichiers (`NNN_GA` associé
   * à `NNN_DR`). Le composant ne fait que mélanger leur ordre, jamais leur
   * contenu : la paire gauche/droite est fixée une fois pour toutes en amont.
   */
  pairs: Pair[];
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

interface PairSequence {
  pairs: Pair[];
  /** Dossier d'origine de chaque paire, même longueur que `pairs`. */
  folders: string[];
}

/**
 * Construit une séquence de paires affichées (gauche/droite), dans un ordre
 * mélangé. Les deux photos d'une paire viennent toujours du même dossier
 * Cloudinary (jamais deux événements mélangés) : c'est garanti en amont par
 * le manifest, qui ne contient que des paires gauche/droite déjà formées
 * d'après le nom des fichiers (`NNN_GA` / `NNN_DR`).
 *
 * Les paires de chaque dossier sont entrelacées (plutôt que groupées à la
 * suite) pour qu'on ne tombe jamais deux fois de suite sur le même dossier,
 * même si celui-ci contient beaucoup de photos.
 *
 * `avoidFolder` permet d'éviter que la toute première paire de cette séquence
 * reprenne le dossier sur lequel une séquence précédente vient de terminer :
 * indispensable puisque cette fonction est rappelée en boucle (voir
 * `usePairedRotation`), la jonction entre deux séquences ne doit pas non plus
 * répéter un dossier.
 */
function buildPairs(groups: ImageGroup[], avoidFolder: string | null = null): PairSequence {
  const queues = shuffle(groups).map((group) => ({
    folder: group.folder,
    queue: shuffle(group.pairs),
  }));

  const pairs: Pair[] = [];
  const folders: string[] = [];
  let lastFolder: string | null = avoidFolder;

  while (queues.some((q) => q.queue.length > 0)) {
    const available = queues.filter((q) => q.queue.length > 0);
    // On évite le dossier de la paire précédente, sauf s'il ne reste plus que lui.
    const candidates = available.filter((q) => q.folder !== lastFolder);
    const pool = candidates.length > 0 ? candidates : available;

    // Tirage aléatoire pondéré par le nombre de paires restantes : un dossier
    // qui a plus de photos a plus de chances de sortir tôt (ça évite qu'un
    // gros dossier reste "coincé" tout seul en fin de séquence, forçant une
    // répétition), mais ce n'est jamais un maximum strict déterministe —
    // sinon le dossier le plus fourni sortirait systématiquement en premier
    // à chaque rechargement de page, au lieu d'un vrai ordre aléatoire.
    const totalRemaining = pool.reduce((sum, q) => sum + q.queue.length, 0);
    let ticket = Math.random() * totalRemaining;
    let chosen = pool[0];
    for (const candidate of pool) {
      ticket -= candidate.queue.length;
      if (ticket < 0) {
        chosen = candidate;
        break;
      }
    }

    const pair = chosen.queue.shift();
    if (!pair) continue;
    pairs.push(pair);
    folders.push(chosen.folder);
    lastFolder = chosen.folder;
  }

  return { pairs, folders };
}

interface CrossfadeState {
  urlA: string | null;
  urlB: string | null;
  active: 'a' | 'b';
}

/**
 * Fait défiler des paires d'images en fondu enchaîné : les deux blocs
 * (gauche/droite) changent en même temps, au même rythme.
 *
 * La rotation tourne indéfiniment : plutôt que de boucler sur une liste figée
 * (ce qui répéterait le même dossier à chaque jonction, puisque la fin et le
 * début d'une liste figée sont forcément fixes), une nouvelle séquence est
 * générée à chaque fin de cycle, en évitant explicitement de redémarrer sur
 * le dossier qui vient de se terminer.
 */
function usePairedRotation(groups: ImageGroup[], intervalMs: number) {
  const [left, setLeft] = useState<CrossfadeState>({ urlA: null, urlB: null, active: 'a' });
  const [right, setRight] = useState<CrossfadeState>({ urlA: null, urlB: null, active: 'a' });

  const groupsRef = useRef<ImageGroup[]>([]);
  const sequenceRef = useRef<PairSequence>({ pairs: [], folders: [] });
  const pointerRef = useRef(0);
  const leftActiveRef = useRef<'a' | 'b'>('a');
  const rightActiveRef = useRef<'a' | 'b'>('a');

  useEffect(() => {
    groupsRef.current = groups;
    if (groups.length === 0) return;

    const sequence = buildPairs(groups);
    sequenceRef.current = sequence;
    pointerRef.current = 0;
    leftActiveRef.current = 'a';
    rightActiveRef.current = 'a';

    const [firstLeft, firstRight] = sequence.pairs[0];
    setLeft({ urlA: firstLeft, urlB: null, active: 'a' });
    setRight({ urlA: firstRight, urlB: null, active: 'a' });
  }, [groups]);

  useEffect(() => {
    if (groups.length === 0) return undefined;

    const interval = setInterval(() => {
      let { pairs, folders } = sequenceRef.current;
      let nextPointer = pointerRef.current + 1;

      if (nextPointer >= pairs.length) {
        // Fin de cycle : on régénère, en évitant de redémarrer sur le dossier
        // qui vient de se terminer (pas de répétition à la jonction).
        const lastFolder = folders[folders.length - 1] ?? null;
        const regenerated = buildPairs(groupsRef.current, lastFolder);
        sequenceRef.current = regenerated;
        pairs = regenerated.pairs;
        folders = regenerated.folders;
        nextPointer = 0;
      }

      if (pairs.length === 0) return;
      const [nextLeft, nextRight] = pairs[nextPointer];

      if (leftActiveRef.current === 'a') {
        leftActiveRef.current = 'b';
        setLeft((prev) => ({ ...prev, urlB: nextLeft, active: 'b' }));
      } else {
        leftActiveRef.current = 'a';
        setLeft((prev) => ({ ...prev, urlA: nextLeft, active: 'a' }));
      }

      if (rightActiveRef.current === 'a') {
        rightActiveRef.current = 'b';
        setRight((prev) => ({ ...prev, urlB: nextRight, active: 'b' }));
      } else {
        rightActiveRef.current = 'a';
        setRight((prev) => ({ ...prev, urlA: nextRight, active: 'a' }));
      }

      pointerRef.current = nextPointer;
    }, intervalMs);

    return () => clearInterval(interval);
  }, [groups, intervalMs]);

  return { left, right };
}

function RotatingPhoto({ urlA, urlB, active }: CrossfadeState) {
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
  const [groups, setGroups] = useState<ImageGroup[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadImages() {
      try {
        const response = await fetch(IMAGES_MANIFEST_URL);
        const data: ImageGroup[] = await response.json();
        if (cancelled || !Array.isArray(data) || data.length === 0) return;
        setGroups(data);
      } catch (error) {
        console.error('Impossible de charger le manifest d\u2019images', error);
      }
    }

    loadImages();
    return () => {
      cancelled = true;
    };
  }, []);

  const { left, right } = usePairedRotation(groups, IMAGE_ROTATION_INTERVAL_MS);

  return (
    <div className="landing">
      <div className="landing-photos">
        <RotatingPhoto {...left} />
        <RotatingPhoto {...right} />
      </div>

      <div className="landing-info">
        <div className="landing-block">
          <h1 className="landing-title">{SITE.title}</h1>
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
