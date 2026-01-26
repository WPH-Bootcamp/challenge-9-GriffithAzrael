// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/home/HomePage';
import AuthPage from './pages/auth/AuthPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,        // layout root
    children: [
      {
        index: true,         // path "/"
        element: <HomePage />,
      },
      {
        path: 'login',       // path "/login"
        element: <AuthPage />,
      },
      {
        path: 'register',    // kalau AuthPage yang sama dipakai untuk register
        element: <AuthPage />,
      },
    ],
  },
]);