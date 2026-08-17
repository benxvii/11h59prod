// Configuration Cloudinary et informations de contact pour le site 11h59 PROD sàrl.

export const CLOUDINARY_CLOUD_NAME = 'duvuxd5kh';
export const CLOUDINARY_FOLDER = '11h59/landing';
export const CLOUDINARY_MAX_RESULTS = 100;

export const CLOUDINARY_RESOURCES_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image?prefix=${CLOUDINARY_FOLDER}&max_results=${CLOUDINARY_MAX_RESULTS}`;

// Rotation des images du hero.
export const IMAGE_ROTATION_INTERVAL_MS = 5000;

export const SITE = {
  title: '11h59 PROD sàrl',
  subtitle: 'Swiss photographer',
  email: 'info@11h59.ch',
  phone: '+41 79 958 86 09',
} as const;

// Version compacte du numéro pour le lien tel: (sans espaces).
export const PHONE_HREF = `tel:${SITE.phone.replace(/\s+/g, '')}`;
export const EMAIL_HREF = `mailto:${SITE.email}`;
