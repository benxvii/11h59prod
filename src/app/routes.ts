import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './components/Landing';

// Une seule route pour l'instant : la landing page à la racine.
export const routes: RouteObject[] = [
  {
    path: '/',
    element: createElement(Layout),
    children: [{ index: true, element: createElement(Landing) }],
  },
];

export default routes;
