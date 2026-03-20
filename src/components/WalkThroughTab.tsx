'use client';

export default function WalkThroughTab() {
  return (
    <div>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <iframe
          src="/helm-ceo-readout.pdf"
          title="Helm CEO Readout"
          style={{
            width: '100%',
            height: 'calc(100vh - 180px)',
            border: 'none',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}
