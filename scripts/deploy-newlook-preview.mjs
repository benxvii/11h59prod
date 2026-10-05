#!/usr/bin/env node
// Déploie un aperçu de la refonte (branche NewLook) dans un sous-dossier
// /NewLook/ du même hébergement, SANS toucher au site en prod à la racine
// (qui reste servi depuis dist/ construit avec `npm run deploy`).
//
// Différences avec scripts/deploy-ftp.mjs :
// - build avec `--base=/NewLook/` dans un dossier séparé (dist-newlook/),
//   pour que les chemins des assets et le routeur (voir src/main.tsx)
//   pointent vers le sous-dossier au lieu de la racine du domaine ;
// - upload FTP préfixé par `NewLook/` (jamais à la racine du serveur) ;
// - .htaccess dédié avec juste le fallback SPA (React Router) pour ce
//   sous-dossier, le reste des règles (www -> non-www) vient déjà du
//   .htaccess racine existant, hérité par Apache.
//
// Usage : node --env-file=.env scripts/deploy-newlook-preview.mjs
// Prérequis : mêmes clés que le déploiement normal (DEPLOY_FTP_*, voir .env).

import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
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
      '3. Relance : node --env-file=.env scripts/deploy-newlook-preview.mjs',
  );
  process.exit(1);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(scriptDir);
const distDir = path.join(projectRoot, 'dist-newlook');
const remotePrefix = 'NewLook';

console.log('Build de l\u2019aperçu (base=/NewLook/)...');
rmSync(distDir, { recursive: true, force: true });
execFileSync('npx', ['vite', 'build', '--base=/NewLook/', `--outDir=${distDir}`], {
  cwd: projectRoot,
  stdio: 'inherit',
});

// Remplace le .htaccess copié depuis public/ (règles pour la racine du
// domaine) par un .htaccess scopé à ce sous-dossier : juste le fallback SPA.
// Le reste (www -> non-www) est déjà géré par le .htaccess racine existant,
// hérité par Apache pour toutes les requêtes, y compris sous /NewLook/.
writeFileSync(
  path.join(distDir, '.htaccess'),
  `<IfModule mod_rewrite.c>
  RewriteEngine On
  # Fallback SPA (React Router) : toute URL sous ce dossier qui ne
  # correspond pas à un fichier ou dossier existant renvoie vers
  # index.html, qui laisse React Router gérer la route côté client.
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
`,
);

function listFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(full));
    } else {
      files.push(path.relative(distDir, full));
    }
  }
  return files;
}

const files = listFiles(distDir);
console.log(`\nEnvoi de ${files.length} fichier(s) vers ${host}/${remotePrefix}/...`);

let failures = 0;
for (const relPath of files) {
  const localPath = path.join(distDir, relPath);
  const remoteUrl = `ftp://${host}/${remotePrefix}/${relPath.split(path.sep).join('/')}`;
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

console.log('\n✓ Aperçu déployé sur https://11h59.ch/NewLook/');
