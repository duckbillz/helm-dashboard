'use client';

export default function GuidingPrinciplesTab() {
  return (
    <div>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <img
          src="/guiding-principles.png"
          alt="Helm Guiding Principles — Near the summit: Series A. Mid-way up the mountain: OKRs. Weekly Top 5."
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
}
