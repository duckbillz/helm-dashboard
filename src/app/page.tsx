'use client';

import { useState, useEffect } from 'react';
import { AppData } from '../lib/types';
import { loadData, saveData, loadDataFromSupabase } from '../lib/storage';
import Header from '../components/Header';
import { TabType } from '../components/Header';
import OKRsTab from '../components/OKRsTab';
import MetricsTab from '../components/MetricsTab';
import SeriesATab from '../components/SeriesATab';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('series-a');
  const [data, setData] = useState<AppData | null>(null);
  const [syncStatus, setSyncStatus] = useState<'loading' | 'synced' | 'offline'>('loading');

  // Step 1: Load from localStorage immediately (fast)
  useEffect(() => {
    setData(loadData());
  }, []);

  // Step 2: Fetch from Supabase in background, use remote data as source of truth
  useEffect(() => {
    async function syncFromSupabase() {
      const remoteData = await loadDataFromSupabase();
      if (remoteData) {
        setData(remoteData);
        saveData(remoteData, true); // Update localStorage cache, skip re-uploading
        setSyncStatus('synced');
      } else {
        setSyncStatus('offline');
      }
    }
    syncFromSupabase();
  }, []);

  function updateData(newData: AppData) {
    setData(newData);
    saveData(newData); // Saves to localStorage + debounced Supabase
    setSyncStatus('synced');
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
