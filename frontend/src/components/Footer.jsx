import React from 'react';
import { Database, Server, Globe, Cpu, CheckCircle2, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-secondary)',
      padding: '3rem 1.5rem 2rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2.5rem'
      }}>
        {/* Col 1: About */}
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.75rem' }}>
            Aura<span className="gradient-text">Store</span> E-Commerce
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Enterprise full-stack architecture built with Django REST Framework, PostgreSQL, and React.js. Engineered for high performance, robust JWT security, and modular scalability.
          </p>
        </div>

        {/* Col 2: Stack Highlights */}
        <div>
          <h5 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Stack Architecture
          </h5>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={15} color="var(--accent-cyan)" />
              <strong>Frontend:</strong> React 18 + Vite + React Router
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={15} color="var(--accent-primary)" />
              <strong>Backend:</strong> Python Django 5.2 + DRF
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={15} color="var(--accent-emerald)" />
              <strong>Database:</strong> PostgreSQL 18 (psycopg3)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={15} color="var(--accent-amber)" />
              <strong>Auth:</strong> JWT (SimpleJWT) with RBAC
            </li>
          </ul>
        </div>

        {/* Col 3: Roadmap */}
        <div>
          <h5 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Development Phases
          </h5>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)' }}>
              <CheckCircle2 size={14} /> Phase 1: Project Setup & Health Verification
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '14px', textAlign: 'center' }}>•</span> Phase 2: JWT Authentication & Users
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '14px', textAlign: 'center' }}>•</span> Phase 3: Catalog & Search Engine
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '14px', textAlign: 'center' }}>•</span> Phase 4-6: Cart, Orders & Payments
            </li>
          </ul>
        </div>
      </div>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div>© 2026 AuraStore Architecture. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Version: 1.0.0-phase1</span>
          <span>API: /api/v1/</span>
          <span>Environment: Development</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
