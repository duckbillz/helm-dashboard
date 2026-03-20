'use client';

import { useState, useEffect } from 'react';
import { AppData } from '../lib/types';
import { loadData, saveData, loadDataFromRemote } from '../lib/storage';
import Header from '../components/Header';
import { TabType } from '../components/Header';
import OKRsTab from '../components/OKRsTab';
import MetricsTab from '../components/MetricsTab';
import SeriesATab from '../components/SeriesATab';
import GuidingPrinciplesTab from '../components/GuidingPrinciplesTab';

const AUTH_KEY = 'helm-dashboard-auth';
const DASHBOARD_PASSWORD = 'helm2026';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('guiding-principles');
  const [data, setData] = useState<AppData | null>(null);
  const [syncStatus, setSyncStatus] = useState<'loading' | 'synced' | 'offline'>('loading');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(AUTH_KEY);
      if (stored === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Step 1: Load from localStorage immediately (fast)
  useEffect(() => {
    setData(loadData());
  }, []);

  // Step 2: Fetch from remote in background, use remote data as source of truth
  useEffect(() => {
    async function syncFromRemote() {
      const remoteData = await loadDataFromRemote();
      if (remoteData) {
        // Remote data exists, use it
        setData(remoteData);
        saveData(remoteData, true); // Update localStorage cache, skip re-uploading
        setSyncStatus('synced');
      } else if (data) {
        // Remote is empty but we have local data, push it to remote
        await (async () => {
          try {
            const res = await fetch('/api/data', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            if (res.ok) {
              setSyncStatus('synced');
            } else {
              setSyncStatus('offline');
            }
          } catch {
            setSyncStatus('offline');
          }
        })();
      } else {
        setSyncStatus('offline');
      }
    }
    if (data) {
      syncFromRemote();
    }
  }, [data]);

  function updateData(newData: AppData) {
    setData(newData);
    saveData(newData); // Saves to localStorage + debounced Supabase
    setSyncStatus('synced');
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === DASHBOARD_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(false);
      sessionStorage.setItem(AUTH_KEY, 'true');
    } else {
      setAuthError(true);
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F5F0DC' }}>
        <div style={{ textAlign: 'center', width: 320 }}>
          <img
            src="/helm-logo.svg"
            alt="Helm"
            style={{ width: 64, height: 64, borderRadius: 16, margin: '0 auto 20px' }}
          />
          <h2 style={{ color: '#061E03', fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Helm Dashboard</h2>
          <p style={{ color: '#7A7A6E', fontSize: 13, marginBottom: 24 }}>Enter password to continue</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setAuthError(false); }}
              placeholder="Password"
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: authError ? '2px solid #E53935' : '1px solid #D4CFC0',
                fontSize: 14,
                outline: 'none',
                background: '#FFFFFF',
                boxSizing: 'border-box',
                marginBottom: 12,
              }}
            />
            {authError && (
              <p style={{ color: '#E53935', fontSize: 12, marginBottom: 12 }}>Incorrect password</p>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: 'none',
                background: '#061E03',
                color: '#FDF7E0',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F5F0DC' }}>
        <div style={{ textAlign: 'center' }}>
          <img
            src="/helm-logo.svg"
            alt="Helm"
            style={{ width: 48, height: 48, borderRadius: 12, margin: '0 auto 12px' }}
          />
          <p style={{ color: '#7A7A6E', fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0DC' }}>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <div style={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: 20, fontSize: 11, color: '#7A7A6E', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', zIndex: 50 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: syncStatus === 'synced' ? '#4CAF50' : syncStatus === 'loading' ? '#FFC107' : '#9E9E9E' }} />
        {syncStatus === 'synced' ? 'Synced' : syncStatus === 'loading' ? 'Syncing...' : 'Local only'}
      </div>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'guiding-principles' && (
          <GuidingPrinciplesTab />
        )}
        {activeTab === 'series-a' && (
          <SeriesATab
            data={data.seriesA}
            onUpdate={seriesA => updateData({ ...data, seriesA })}
          />
        )}
        {activeTab === 'okrs' && (
          <OKRsTab
            objectives={data.objectives}
            onUpdate={objectives => updateData({ ...data, objectives })}
            teamMembers={data.teamMembers}
          />
        )}
        {activeTab === 'metrics' && (
          <MetricsTab
            metrics={data.metrics}
            onUpdate={metrics => updateData({ ...data, metrics })}
          />
        )}
      </main>
    </div>
  );
}
