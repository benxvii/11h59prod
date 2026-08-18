# 11h59 PROD sàrl — landing page

Landing page minimaliste, une seule route (`/`), construite avec Vite + React + TypeScript + React Router.

## Démarrer

```bash
npm install
npm run dev
```

## Photos Cloudinary

Les images du hero viennent du dossier Cloudinary `11h59/landing` (cloud `duvuxd5kh`). L'API de listing de Cloudinary (`/resources`) exige une authentification `api_key` + `api_secret` : elle ne peut donc pas être appelée depuis le navigateur sans exposer ces secrets publiquement.

À la place, la liste des images est générée à l'avance côté machine locale (ou CI) dans `public/images.json`, un fichier statique que la landing page se contente de lire au chargement.

Pour (re)générer ce fichier après avoir ajouté/retiré des photos dans le dossier Cloudinary :

```bash
cp .env.example .env
# renseigner CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET
# (https://console.cloudinary.com/settings/api-keys)

npm run fetch:images
```

Le fichier `public/images.json` généré ne contient que des URLs publiques (`secure_url`), il peut donc être commité sans risque. Les clés API, elles, ne doivent jamais quitter le fichier `.env` local (ignoré par git).

## Build

```bash
npm run build
```
