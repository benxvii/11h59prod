# Mode d'emploi — 11h59prod

Tu n'as pas besoin d'apprendre à coder.

Tu parles à un assistant, en français, dans Cursor. Il fait les changements.

Public : toi (quotidien) et Benoît / l'assistant (détail technique). Repo `benxvii/11h59prod`.

---

## Deux endroits, deux rôles

**Le texte** (titre, sous-titre, email, téléphone) vit dans le projet, sur l'ordinateur. Tu le changes dans Cursor.

**Les photos du hero** vivent dans une bibliothèque en ligne : Cloudinary. Tu y déposes tes images, et tu y supprimes celles que tu ne veux plus.

**Le site en ligne** n'a pas encore d'adresse ni de mise en ligne automatique configurées. Pour l'instant, le projet tourne seulement en local (sur l'ordinateur) et sur GitHub. Voir Benoît pour la suite.

| Élément                      | Rôle                                                        |
| ----------------------------- | ------------------------------------------------------------ |
| **Code** (`src/`)              | Texte, structure de la page                                  |
| **`src/config/site.ts`**       | Fichier éditorial principal (titre, sous-titre, email, tél.) |
| **Cloudinary**                 | Photos du hero (dossier `11h59/landing`)                     |
| **`public/images.json`**       | Manifeste des photos (généré, commité dans Git)              |
| **`.env`**                     | Clés Cloudinary (API key/secret) — **jamais** commité        |
| **GitHub**                     | Code source (`benxvii/11h59prod`)                             |

`site.ts` se modifie en local (projet ouvert dans Cursor), pas directement sur GitHub. Après commit + push, le code est à jour sur GitHub.

Les photos du hero viennent du manifeste `public/images.json`, régénéré à la main (voir § 2). Pas de liste de photos dans `site.ts`.

---

## Quoi installer sur ton Mac

**1. Cursor**
L'application où tu ouvres le projet et tu parles à l'assistant.

[cursor.com](https://cursor.com)

**2. Node.js**
Un petit programme (prendre la version **LTS**). Sans lui, tu ne peux pas voir le site sur ton ordi avant de publier.

[nodejs.org](https://nodejs.org)

Git est souvent déjà là. Cursor le propose aussi à l'installation.

### Première mise en route

1. Ouvrir le projet dans Cursor
2. Dans le terminal, une seule fois : `npm install`
3. Pour voir le site chez toi : `npm run dev`
4. Ouvrir l'adresse qui s'affiche (souvent [http://localhost:5173](http://localhost:5173))

---

## Où te connecter

Benoît t'invite sur le projet GitHub et te donne l'accès Cloudinary. Dans Cursor, tu te connectes une fois avec GitHub.

| Où             | Adresse                                                  | À quoi ça sert                                      |
| -------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| **Cursor**     | l'appli sur ton Mac                                        | Modifier les textes. Tu parles à l'assistant.         |
| **GitHub**     | [github.com/benxvii/11h59prod](https://github.com/benxvii/11h59prod) | Envoyer tes changements de code.          |
| **Cloudinary** | [console.cloudinary.com](https://console.cloudinary.com)  | Déposer ou supprimer les photos du hero (cloud `duvuxd5kh`, dossier `11h59/landing`). |

---

## Les 2 gestes du quotidien

### Changer un texte

1. Ouvrir Cursor
2. Dire par exemple : *Change le sous-titre par "Photographe suisse"*
3. Regarder le résultat en local (`npm run dev`)
4. Demander à l'assistant d'envoyer les changements

Pas besoin de Cloudinary pour du texte. Les champs possibles : **§ 1**.

### Ajouter ou retirer des photos du hero

Photos : Cloudinary, puis régénération du manifeste (pas de sync automatique pour l'instant). Procédure : **§ 2**.

---

## Phrases à dire à l'assistant

> Change le sous-titre par "Photographe suisse"

> Change l'email de contact par contact@11h59.ch

> Change le numéro de téléphone par +41 79 000 00 00

> J'ai ajouté des photos dans Cloudinary dans 11h59/landing, régénère le manifeste d'images

> J'ai supprimé des photos dans 11h59/landing, régénère le manifeste d'images

> Envoie les changements avec un message en français

---

## Fichiers utiles

| Fichier                                | Contenu                                                    |
| --------------------------------------- | ------------------------------------------------------------ |
| `src/config/site.ts`                    | Titre, email, téléphone, config Cloudinary                 |
| `src/app/components/Landing.tsx`        | Page d'accueil : rotation des photos, bloc contact           |
| `cloudinary.config.json`                | Cloud name + dossier Cloudinary (partagé code + script)      |
| `scripts/fetch-cloudinary-images.mjs`   | Génère `public/images.json` à partir de Cloudinary           |
| `public/images.json`                    | Manifeste des photos (URLs publiques, commité dans Git)      |
| `.env` (jamais commité)                 | `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`                |
| `.env.example`                          | Modèle de `.env` à copier                                     |

### Contenu de `site.ts`

| Champ      | Usage                                      |
| ----------- | --------------------------------------------- |
| `title`     | Titre principal affiché ("11h59 PROD sàrl")   |
| `email`     | Email de contact (lien `mailto:` cliquable)   |
| `phone`     | Téléphone (lien `tel:` cliquable)             |

### Déployer du code

```bash
git add .
git commit -m "description courte"
git push origin main
```

Ou demander à l'assistant : *Envoie les changements avec un message en français.*

Il n'y a pas encore d'hébergement ni de nom de domaine branchés : le push met seulement le code à jour sur GitHub, pas sur un site visible publiquement. À voir avec Benoît.

---

## 1. Modifier le texte (détail)

Ouvrir `src/config/site.ts` (ou laisser Cursor le faire). Tout est dans l'objet `SITE` :

```ts
export const SITE = {
  title: '11h59 PROD sàrl',
  email: 'info@11h59.ch',
  phone: '+41 79 958 86 09',
} as const;
```

Changer une valeur ici suffit : les liens email/téléphone cliquables se mettent à jour automatiquement.

---

## 2. Photos du hero (Cloudinary)

Une seule galerie : le dossier `11h59/landing` sur Cloudinary (cloud `duvuxd5kh`), **sous-dossiers compris** (ex. `11h59/landing/Paléo`, `11h59/landing/Montreux`...). Tu peux organiser tes photos en sous-dossiers par thème/événement si tu veux, le script de régénération les retrouve toutes automatiquement, peu importe leur niveau de rangement. Les photos tournent en fondu enchaîné sur la page d'accueil : toujours deux photos du même sous-dossier côte à côte, dans la paire gauche/droite fixée par leur nom de fichier (voir § Nommage des photos), jamais deux sous-dossiers différents mélangés, et jamais deux fois de suite le même sous-dossier.

**Aucune modification de code** pour ajouter ou retirer une photo. Mais contrairement à un site avec synchronisation automatique, il faut relancer une commande à la main après chaque changement (voir plus bas) : pas encore de bouton "Sync" sur GitHub pour ce projet.

### Ajouter ou retirer une photo

1. [console.cloudinary.com](https://console.cloudinary.com) → **Assets**
2. Ouvrir le dossier `11h59/landing`
3. **Ajouter** : **Upload** → glisser les JPG, puis **renommer chaque photo** selon la règle ci-dessous (§ Nommage des photos). **Retirer** : cliquer la photo → **Delete** (poubelle) → confirmer
4. Régénérer le manifeste (ci-dessous)
5. Commit + push de `public/images.json`

### Nommage des photos (obligatoire : gauche/droite)

Dans chaque sous-dossier, les photos vont par paires affichées côte à côte : une à **gauche**, une à **droite**. Cloudinary ne sait pas deviner laquelle va où : c'est le **nom du fichier** qui le détermine.

Règle : `NNN_GA` pour la photo de gauche, `NNN_DR` pour celle de droite, où `NNN` est un numéro sur 3 chiffres (`001`, `002`, `003`...) identique pour les deux photos d'une même paire.

| Exemple        | Rôle                          |
| -------------- | ----------------------------- |
| `001_GA.jpg`   | Photo de **gauche** de la paire n°1 |
| `001_DR.jpg`   | Photo de **droite** de la paire n°1 |
| `002_GA.jpg`   | Photo de **gauche** de la paire n°2 |
| `002_DR.jpg`   | Photo de **droite** de la paire n°2 |

Pour renommer une photo sur Cloudinary : clic sur la photo → champ **Public ID** → remplacer par `001_GA` (sans l'extension) → **Save**.

Points importants :

- La numérotation (`001`, `002`...) ne compte que **par sous-dossier** : chaque événement repart à `001`.
- Une photo `GA` sans son `DR` correspondant (ou inversement) est **ignorée silencieusement** par le script de régénération (avec un avertissement dans le terminal) : elle n'apparaîtra jamais sur le site tant que sa paire manque.
- Une photo qui ne suit pas du tout cette règle de nommage est aussi ignorée.

### Taille et format des photos

Les deux blocs du hero sont **plus hauts que larges** (deux colonnes étroites, sur mobile comme sur desktop) et la photo remplit tout le cadre en étant rognée si besoin (`cover`) : les photos verticales ou carrées fonctionnent mieux qu'un format très panoramique.

| Critère        | Recommandation                                                        |
| ---------------- | ------------------------------------------------------------------------ |
| Format fichier  | JPG (ou WebP)                                                          |
| Orientation     | Portrait ou carré de préférence                                        |
| Résolution      | 1600 à 2400 px sur le plus grand côté (inutile d'aller au-delà, ça n'ajoute que du poids) |
| Poids du fichier | Viser 300 Ko à 1 Mo par photo (qualité export ~75-85%)                 |
| À éviter        | Fichiers au-delà de 5 Mo : ça ralentit l'affichage sur le site           |

Cloudinary n'impose pas ces valeurs, elles servent juste à garder le site rapide à charger sans perdre en netteté sur les écrans Retina.

### Régénérer le manifeste

Cette étape demande les clés API Cloudinary (pas juste le login web). Si tu ne les as pas, demande-les à Benoît ou récupère-les toi-même sur [console.cloudinary.com/settings/api-keys](https://console.cloudinary.com/settings/api-keys).

```bash
cp .env.example .env
# renseigner CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans .env

npm run fetch:images
```

Le fichier `public/images.json` généré ne contient que des URLs publiques, il peut être commité sans risque. Les clés API, elles, restent dans `.env` (jamais envoyé sur GitHub).

Le plus simple au quotidien : dire à l'assistant *"J'ai ajouté/supprimé des photos dans Cloudinary, régénère le manifeste"* — il lance la commande et prépare le commit.

---

## Récap rapide

| Tâche                           | Cloudinary | Fichiers                         | Git push |
| --------------------------------- | ------------ | ----------------------------------- | ---------- |
| Modifier le titre/sous-titre/contact | —          | `site.ts`                           | ✅         |
| Ajouter / retirer une photo du hero | ✅         | `public/images.json` (régénéré)     | ✅         |

---

## Erreurs fréquentes

| Problème                              | Cause                                              | Solution                                               |
| ---------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| Hero vide / fond gris uni                | `public/images.json` vide ou pas à jour               | Relancer `npm run fetch:images`, puis commit + push        |
| `npm run dev` plante (Rolldown/Rollup)   | `node_modules` cassé (bug npm des dépendances optionnelles) | `rm -rf node_modules package-lock.json && npm install` |
| `Invalid credentials` sur l'API Cloudinary | Appel direct à l'Admin API depuis le navigateur (normal, elle exige des clés) | Toujours passer par `npm run fetch:images` en local |
| Téléphone/email pas cliquable            | Mauvais format dans `site.ts`                         | Vérifier `email`/`phone` dans l'objet `SITE`                |

---

## Ce que l'assistant ne doit pas faire sans demande explicite

- Créer des commits ou pousser sur GitHub
- Modifier ou committer le fichier `.env` / exposer les clés Cloudinary
- Committer des photos du hero directement dans Git (→ elles passent par Cloudinary + manifeste)
- Changer les couleurs, la typographie ou la mise en page sans valider le rendu avec toi
