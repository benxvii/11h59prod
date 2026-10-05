import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from './app/routes';
import './index.css';

// En sous-dossier (ex: prévisualisation sur /NewLook/, build avec
// `vite build --base=/NewLook/`), BASE_URL vaut "/NewLook/" : on le passe en
// basename au routeur pour que les routes internes (/photo, /contact...)
// restent relatives au sous-dossier. En prod normale (base "/"), basename
// vaut "/" et ne change rien.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
const router = createBrowserRouter(routes, { basename });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
