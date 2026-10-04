#!/usr/bin/env node
// Génère public/images.json à partir du dossier Cloudinary configuré, via
// l'Admin API (authentifiée). À lancer localement (ou en CI) avec
// CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET dans l'environnement — jamais
// exposées au client, jamais commitées.
//
// Usage : npm run fetch:images
// Prérequis : cp .env.example .env, puis renseigner les deux clés.

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cloudinaryConfig from '../cloudinary.config.json' with { type: 'json' };

const { cloudName: CLOUD_NAME, folder: FOLDER } = cloudinaryConfig;
const MAX_RESULTS = 100;

const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error(
    'CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET sont requis.\n' +
      '1. cp .env.example .env\n' +
      '2. Renseigne les deux clés (https://console.cloudinary.com/settings/api-keys)\n' +
      '3. Relance : npm run fetch:images',
  );
  process.exit(1);
}

const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

// Les photos peuvent être rangées dans des sous-dossiers (ex. "11h59/landing/Paléo"),
// pas forcément directement dans FOLDER. Le endpoint classique /resources (prefix=...)
// ne retrouve pas ces images en mode "Dynamic Folders" de Cloudinary : on utilise donc
// l'API Search, qui matche récursivement via asset_folder.
//
// On garde la trace du sous-dossier de chaque image : la landing affiche toujours
// deux photos du même sous-dossier côte à côte (jamais deux événements mélangés).
async function fetchAllResources() {
  const resources = [];
  let nextCursor;
  const expression = `asset_folder:${FOLDER} OR asset_folder:${FOLDER}/*`;

  do {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expression,
        max_results: MAX_RESULTS,
        next_cursor: nextCursor,
        fields: ['public_id', 'asset_folder', 'secure_url'],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Cloudinary API ${response.status}: ${text}`);
    }

    const data = await response.json();
    for (const resource of data.resources ?? []) {
      resources.push({
        folder: resource.asset_folder ?? FOLDER,
        url: resource.secure_url,
        // Public ID : identifiant venant du nom de fichier chargé dans
        // Cloudinary (même logique que sur karinebauzin.ch). Pour le changer,
        // il faut éditer le Public ID de la photo (pas juste le "nom affiché").
        name: resource.public_id,
      });
    }
    nextCursor = data.next_cursor;
  } while (nextCursor);

  return resources;
}

// Convention de nommage : "NNN_GA" (gauche) / "NNN_DR" (droite), NNN = numéro
// sur 3 positions. Cloudinary ajoute souvent un suffixe aléatoire après
// (ex. "001_GA_jnszub") : on ne regarde que le tout début du nom.
const NAME_PATTERN = /^(\d{3})_(GA|DR)(?:_|$)/i;

/**
 * Regroupe les images par sous-dossier Cloudinary, puis associe chaque numéro
 * à sa paire gauche/droite d'après le nom de fichier. Les images qui ne
 * suivent pas la convention, ou dont il manque le GA ou le DR correspondant,
 * sont ignorées (avec un avertissement) plutôt que de bloquer la génération.
 */
function groupByFolder(resources) {
  const order = [];
  const byFolder = new Map();

  for (const { folder, url, name } of resources) {
    if (!byFolder.has(folder)) {
      byFolder.set(folder, new Map());
      order.push(folder);
    }

    const match = NAME_PATTERN.exec(name);
    if (!match) {
      console.warn(`Ignoré (ne suit pas la convention NNN_GA/NNN_DR) : ${folder}/${name}`);
      continue;
    }

    const [, number, side] = match;
    const bySide = byFolder.get(folder);
    if (!bySide.has(number)) bySide.set(number, {});
    bySide.get(number)[side.toUpperCase()] = url;
  }

  return order.map((folder) => {
    const bySide = byFolder.get(folder);
    const pairs = [];

    for (const [number, sides] of [...bySide.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      if (sides.GA && sides.DR) {
        pairs.push([sides.GA, sides.DR]);
      } else {
        console.warn(`Paire incomplète ignorée : ${folder}/${number} (${sides.GA ? 'GA' : 'DR'} seul)`);
      }
    }

    return { folder, pairs };
  });
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(scriptDir);
const outputPath = path.join(projectRoot, 'public', 'images.json');

try {
  const resources = await fetchAllResources();
  const groups = groupByFolder(resources);
  const totalPairs = groups.reduce((sum, g) => sum + g.pairs.length, 0);
  await writeFile(outputPath, `${JSON.stringify(groups, null, 2)}\n`, 'utf-8');
  console.log(
    `✓ ${totalPairs} paire(s) dans ${groups.length} dossier(s) écrite(s) dans public/images.json`,
  );
  if (resources.length === 0) {
    console.warn(`Aucune image trouvée dans le dossier Cloudinary "${FOLDER}".`);
  }
} catch (error) {
  console.error('Échec de la récupération des images Cloudinary :', error.message);
  process.exit(1);
}
