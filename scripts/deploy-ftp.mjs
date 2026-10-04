#!/usr/bin/env node
// Envoie le contenu de dist/ (généré par `npm run build`) vers l'hébergement
// web Infomaniak par FTP. À lancer avec CLOUDINARY-like credentials dans
// l'environnement : DEPLOY_FTP_HOST / DEPLOY_FTP_USER / DEPLOY_FTP_PASSWORD
// (jamais exposées au client, jamais commitées, voir .env).
//
// Usage : npm run deploy   (build + envoi en un coup)
// Prérequis : cp .env.example .env, puis renseigner les 3 clés DEPLOY_FTP_*.

import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const host = process.env.DEPLOY_FTP_HOST;
const user = process.env.DEPLOY_FTP_USER;
const password = process.env.DEPLOY_FTP_PASSWORD;

if (!host || !user || !password) {
  console.error(
    'DEPLOY_FTP_HOST, DEPLOY_FTP_USER et DEPLOY_FTP_PASSWORD sont requis.\n' +
      '1. cp .env.example .env\n' +
      "2. Renseigne les 3 clés (Manager Infomaniak → Hosting → FTP-SFTP et accès SSH)\n" +
      '3. Relance : npm run deploy',
  );
  process.exit(1);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(scriptDir);
const distDir = path.join(projectRoot, 'dist');

/** Liste tous les fichiers de `dir`, récursivement, en chemins relatifs à `distDir`. */
function listFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...listFiles(full));
    } else {
      files.push(path.relative(distDir, full));
    }
  }
  return files;
}

let files;
try {
  files = listFiles(distDir);
} catch {
  console.error('Dossier dist/ introuvable : lance `npm run build` avant `npm run deploy`.');
  process.exit(1);
}

if (files.length === 0) {
  console.error('dist/ est vide : lance `npm run build` avant `npm run deploy`.');
  process.exit(1);
}

console.log(`Envoi de ${files.length} fichier(s) vers ${host}...`);

let failures = 0;
for (const relPath of files) {
  const localPath = path.join(distDir, relPath);
  const remoteUrl = `ftp://${host}/${relPath.split(path.sep).join('/')}`;
  try {
    execFileSync(
      'curl',
      ['-s', '--ftp-create-dirs', '-T', localPath, remoteUrl, '--user', `${user}:${password}`],
      { stdio: 'inherit' },
    );
    console.log(`  ✓ ${relPath}`);
  } catch (error) {
    failures += 1;
    console.error(`  ✗ ${relPath} : ${error.message}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} fichier(s) n'ont pas pu être envoyés.`);
  process.exit(1);
}

console.log('\n✓ Déploiement terminé.');
