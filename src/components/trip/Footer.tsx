export function Footer() {
  return (
    <div style={{ padding: '24px 0 44px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.15)' }}>
        Made with{' '}
        <span
          style={{
            fontFamily: 'var(--rally-font-display)',
            fontWeight: 700,
            color: 'rgba(255,255,255,.22)',
          }}
        >
          Rally
        </span>
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.08)', marginTop: 2, cursor: 'pointer' }}>
        Plan your own trip →
      </div>
    </div>
  );
}
