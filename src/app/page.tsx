'use client';

import { useState, useEffect } from 'react';
import { AppData } from '../lib/types';
import { loadData, saveData } from '../lib/storage';
import Header from '../components/Header';
import { TabType } from '../components/Header';
import OKRsTab from '../components/OKRsTab';
import MetricsTab from '../components/MetricsTab';
import SeriesATab from '../components/SeriesATab';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('series-a');
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    setData(loadData());
  }, []);

  function updateData(newData: AppData) {
    setData(newData);
    saveData(newData);
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
