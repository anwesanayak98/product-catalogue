import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="page-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>Made for finding your next favourite.</p>
        <span>Product Catalogue</span>
      </footer>
    </div>
  );
}
