import { Outlet } from 'react-router-dom';
import './Layout.css';

// Layout minimal : pas de header, pas de menu, juste le contenu de la page.
export default function Layout() {
  return (
    <div className="app-layout">
      <Outlet />
    </div>
  );
}
