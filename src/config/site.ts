// Configuration Cloudinary et informations de contact pour le site 11h59 PROD sàrl.
import cloudinaryConfig from '../../cloudinary.config.json';

export const CLOUDINARY_CLOUD_NAME = cloudinaryConfig.cloudName;
export const CLOUDINARY_FOLDER = cloudinaryConfig.folder;

// L'API Admin Cloudinary (`/resources`) exige une authentification api_key +
// api_secret : elle ne peut pas être appelée depuis le navigateur sans exposer
// ces secrets publiquement. La liste des images est donc générée à l'avance
// côté serveur par `scripts/fetch-cloudinary-images.mjs` (voir README) dans ce
// fichier JSON statique, servi tel quel par Vite depuis `public/`.
export const IMAGES_MANIFEST_URL = '/images.json';

// Rotation des images du hero.
export const IMAGE_ROTATION_INTERVAL_MS = 8000;

export const SITE = {
  title: '11h59 PROD sàrl',
  email: 'info@11h59.ch',
  phone: '+41 79 958 86 09',
} as const;

// Version compacte du numéro pour le lien tel: (sans espaces).
export const PHONE_HREF = `tel:${SITE.phone.replace(/\s+/g, '')}`;
export const EMAIL_HREF = `mailto:${SITE.email}`;
