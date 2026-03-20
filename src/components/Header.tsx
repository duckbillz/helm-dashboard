'use client';

export type TabType = 'guiding-principles' | 'series-a' | 'okrs' | 'metrics';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { key: TabType; label: string }[] = [
  { key: 'guiding-principles', label: 'Guiding Principles' },
  { key: 'series-a', label: 'Series A Milestones' },
  { key: 'okrs', label: 'OKRs' },
  { key: 'metrics', label: 'Key Metrics' },
];

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header style={{ background: '#2D5A3D' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="/helm-logo.svg"
              alt="Helm"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
              }}
            />
            <span style={{ color: 'white', fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>
              Helm
            </span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            Management Dashboard
          </span>
        </div>
        <nav style={{ display: 'flex', gap: 32 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 0',
                fontSize: 14,
                cursor: 'pointer',
                color: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.6)',
                borderBottom: activeTab === tab.key ? '3px solid #C8D96F' : '3px solid transparent',
                fontWeight: activeTab === tab.key ? 600 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
