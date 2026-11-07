import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { CategoryPage } from './pages/CategoryPage';
import { HomePage } from './pages/HomePage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { SearchPage } from './pages/SearchPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'categories/:category', element: <CategoryPage /> },
      { path: 'products/:id', element: <ProductDetailsPage /> },
    ],
  },
]);
