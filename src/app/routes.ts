import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';
import Layout from './components/Layout';
import Entry from './components/Entry';
import PhotoPage from './components/PhotoPage';
import SpeakingPage from './components/SpeakingPage';
import ContactPage from './components/ContactPage';

// Page d'entrée à la racine, puis 3 sections : Photo, Prise de parole, Contact.
export const routes: RouteObject[] = [
  {
    path: '/',
    element: createElement(Layout),
    children: [
      { index: true, element: createElement(Entry) },
      { path: 'photo', element: createElement(PhotoPage) },
      { path: 'prise-de-parole', element: createElement(SpeakingPage) },
      { path: 'contact', element: createElement(ContactPage) },
    ],
  },
];

export default routes;
