import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import './index.css';

import Layout from './Layout';
import Home from './components/Home/Home';
import Contact from './components/Contact/Contact';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Otp from './components/Otp/Otp';
import Dashboard from './components/Dashboard/Dashboard';

// Function to check if the user is authenticated
const isAuthenticated = () => {
  return localStorage.getItem("userToken") !== null;
};

// Protected Route Component
const ProtectedRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <Home /> },
      { path: 'contact-us', element: <Contact /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'otp', element: <Otp /> },
      {
        path: 'dashboard',
        element: <ProtectedRoute />,  // Wrap Dashboard in Protected Route
        children: [{ path: '', element: <Dashboard /> }]
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
