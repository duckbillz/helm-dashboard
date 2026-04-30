'use client';

export type TabType = 'series-a' | 'okrs' | 'metrics' | 'tools';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSignOut?: () => void;
  toolsAlertCount?: number;
}

const tabs: { key: TabType; label: string }[] = [
  { key: 'series-a', label: 'Series A Milestones' },
  { key: 'okrs', label: 'OKRs' },
  { key: 'metrics', label: 'Key Metrics' },
  { key: 'tools', label: 'Tools' },
];

export default function Header({ activeTab, onTabChange, onSignOut, toolsAlertCount = 0 }: HeaderProps) {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {toolsAlertCount > 0 && (
              <button
                onClick={() => onTabChange('tools')}
                title={`${toolsAlertCount} tool renewal${toolsAlertCount === 1 ? '' : 's'} need attention`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#C62828',
                  border: 'none',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '5px 11px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  animation: 'helm-pulse 1.6s ease-in-out infinite',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'white',
                  }}
                />
                {toolsAlertCount} renewal{toolsAlertCount === 1 ? '' : 's'} due
              </button>
            )}
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              Management Dashboard
            </span>
            {onSignOut && (
              <button
                onClick={onSignOut}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: 12,
                  padding: '4px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 32 }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            const showAlert = tab.key === 'tools' && toolsAlertCount > 0;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '12px 0',
                  fontSize: 14,
                  cursor: 'pointer',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                  borderBottom: isActive ? '3px solid #C8D96F' : '3px solid transparent',
                  fontWeight: isActive ? 600 : 400,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {tab.label}
                {showAlert && (
                  <span
                    style={{
                      display: 'inline-block',
                      minWidth: 18,
                      padding: '0 5px',
                      height: 18,
                      lineHeight: '18px',
                      textAlign: 'center',
                      background: '#C62828',
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 9,
                    }}
                  >
                    {toolsAlertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <style>{`
        @keyframes helm-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(198, 40, 40, 0.6); }
          50%      { box-shadow: 0 0 0 6px rgba(198, 40, 40, 0); }
        }
      `}</style>
    </header>
  );
}
