import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Verifying admin authorization...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  if (!isAdmin) {
    return (
      <div className="glass-card" style={{ maxWidth: '540px', margin: '6rem auto', padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--accent-rose)' }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          This administrative control portal requires staff or administrator privileges.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return <Outlet />;
};

export default AdminRoute;
