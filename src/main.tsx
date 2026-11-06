import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import routes from './app/routes';
import './index.css';

// BASE_URL vaut "/" en production (site servi à la racine) ; on le passe en
// basename au routeur pour que les routes restent correctes si le build est
// un jour servi depuis un sous-dossier (`vite build --base=/dossier/`).
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
const router = createBrowserRouter(routes, { basename });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
