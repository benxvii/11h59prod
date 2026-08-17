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

async function fetchAllResources() {
  const urls = [];
  let nextCursor;

  do {
    const params = new URLSearchParams({
      prefix: FOLDER,
      max_results: String(MAX_RESULTS),
      type: 'upload',
    });
    if (nextCursor) params.set('next_cursor', nextCursor);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?${params}`,
      { headers: { Authorization: `Basic ${auth}` } },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Cloudinary API ${response.status}: ${text}`);
    }

    const data = await response.json();
    for (const resource of data.resources ?? []) {
      urls.push(resource.secure_url);
    }
    nextCursor = data.next_cursor;
  } while (nextCursor);

  return urls;
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(scriptDir);
const outputPath = path.join(projectRoot, 'public', 'images.json');

try {
  const urls = await fetchAllResources();
  await writeFile(outputPath, `${JSON.stringify(urls, null, 2)}\n`, 'utf-8');
  console.log(`✓ ${urls.length} image(s) écrite(s) dans public/images.json`);
  if (urls.length === 0) {
    console.warn(`Aucune image trouvée dans le dossier Cloudinary "${FOLDER}".`);
  }
} catch (error) {
  console.error('Échec de la récupération des images Cloudinary :', error.message);
  process.exit(1);
}
