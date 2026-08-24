import React, { useState } from 'react';
import { 
  Database, 
  Server, 
  Globe, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Terminal,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useHealth } from '../hooks/useHealth';
import { formatDate } from '../utils/formatters';

const HealthWidget = () => {
  const { healthData, loading, error, lastChecked, refetch } = useHealth(10000);
  const [showRawJson, setShowRawJson] = useState(false);

  const isHealthy = healthData?.status === 'healthy';
  const isDbConnected = healthData?.database?.status === 'connected';

  return (
    <div className="glass-card" style={{ marginBottom: '2rem' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: isHealthy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            padding: '0.65rem',
            borderRadius: 'var(--radius-md)',
            color: isHealthy ? 'var(--accent-emerald)' : 'var(--accent-rose)'
          }}>
            {isHealthy ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                Full-Stack System Connectivity Verification
              </h3>
              <span className={`badge ${isHealthy ? 'badge-success' : 'badge-danger'}`}>
                <span className={`pulse-dot ${isHealthy ? 'success' : 'danger'}`}></span>
                {isHealthy ? 'Phase 1 Operational' : 'Connection Issues'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              End-to-end pipeline test: <strong>React.js (Vite)</strong> ➔ <strong>Django REST Framework</strong> ➔ <strong>PostgreSQL 18</strong>
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={refetch}
          disabled={loading}
          className="btn btn-outline"
          style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
        >
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Testing Link...' : 'Test Connectivity Now'}
        </button>
      </div>

      {/* 3-Tier Architecture Connectivity Cards */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        {/* Tier 1: Frontend Client */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={18} color="var(--accent-cyan)" />
              <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Frontend Client</span>
            </div>
            <span className="badge badge-success">Active</span>
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <div style={{ marginBottom: '0.35rem' }}><strong>Framework:</strong> React 18 + Vite</div>
            <div style={{ marginBottom: '0.35rem' }}><strong>Port:</strong> 127.0.0.1:5173</div>
            <div><strong>Environment:</strong> Development</div>
          </div>
        </div>

        {/* Tier 2: Backend REST API */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={18} color="var(--accent-primary)" />
              <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Django REST API</span>
            </div>
            <span className={`badge ${isHealthy ? 'badge-success' : 'badge-danger'}`}>
              {isHealthy ? 'Online 200 OK' : 'Offline'}
            </span>
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <div style={{ marginBottom: '0.35rem' }}><strong>Version:</strong> {healthData?.api_version || 'v1'} (/api/v1/)</div>
            <div style={{ marginBottom: '0.35rem' }}><strong>Base URL:</strong> http://127.0.0.1:8000</div>
            <div><strong>CORS:</strong> Headers Configured</div>
          </div>
        </div>

        {/* Tier 3: PostgreSQL Database */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: `1px solid ${isDbConnected ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} color="var(--accent-emerald)" />
              <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>PostgreSQL Database</span>
            </div>
            <span className={`badge ${isDbConnected ? 'badge-success' : 'badge-danger'}`}>
              {isDbConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <div style={{ marginBottom: '0.35rem' }}><strong>Database:</strong> {healthData?.database?.name || 'ecommerce_db'}</div>
            <div style={{ marginBottom: '0.35rem' }}><strong>Engine:</strong> {healthData?.database?.engine || 'postgresql'}</div>
            <div><strong>Latency:</strong> {healthData?.database?.latency_ms ? `${healthData.database.latency_ms} ms` : 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Error or Live Diagnostic Details */}
      {error ? (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#fb7185',
          fontSize: '0.85rem',
          marginBottom: '1rem'
        }}>
          <strong>Connection Error:</strong> {error}
        </div>
      ) : null}

      {/* Accordion for Raw JSON API Response */}
      <div>
        <button
          onClick={() => setShowRawJson(!showRawJson)}
          style={{
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0'
          }}
        >
          <Terminal size={14} />
          <span>{showRawJson ? 'Hide Raw API Response' : 'Inspect Raw /api/v1/health/ Payload'}</span>
          {showRawJson ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showRawJson && (
          <pre style={{
            marginTop: '0.75rem',
            padding: '1rem',
            backgroundColor: '#05070d',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            color: '#34d399',
            fontSize: '0.8rem',
            overflowX: 'auto',
            fontFamily: 'monospace'
          }}>
            {JSON.stringify(healthData || { error }, null, 2)}
          </pre>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HealthWidget;
