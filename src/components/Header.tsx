'use client';

interface HeaderProps {
  activeTab: 'okrs' | 'metrics';
  onTabChange: (tab: 'okrs' | 'metrics') => void;
}

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
          <button
            onClick={() => onTabChange('okrs')}
            className={activeTab === 'okrs' ? 'tab-active' : 'tab-inactive'}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 0',
              fontSize: 14,
              cursor: 'pointer',
              color: activeTab === 'okrs' ? 'white' : 'rgba(255,255,255,0.6)',
              borderBottom: activeTab === 'okrs' ? '3px solid #C8D96F' : '3px solid transparent',
              fontWeight: activeTab === 'okrs' ? 600 : 400,
            }}
          >
            OKRs
          </button>
          <button
            onClick={() => onTabChange('metrics')}
            className={activeTab === 'metrics' ? 'tab-active' : 'tab-inactive'}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 0',
              fontSize: 14,
              cursor: 'pointer',
              color: activeTab === 'metrics' ? 'white' : 'rgba(255,255,255,0.6)',
              borderBottom: activeTab === 'metrics' ? '3px solid #C8D96F' : '3px solid transparent',
              fontWeight: activeTab === 'metrics' ? 600 : 400,
            }}
          >
            Key Metrics
          </button>
        </nav>
      </div>
    </header>
  );
}
