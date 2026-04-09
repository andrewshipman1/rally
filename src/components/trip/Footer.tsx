import type { ThemeId } from '@/lib/themes/types';
import { getCopy } from '@/lib/copy/get-copy';

export function Footer({ themeId }: { themeId: ThemeId }) {
  return (
    <div style={{ padding: '24px 0 44px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.15)' }}>
        {getCopy(themeId, 'tripPageShared.footer.madeWith')}{' '}
        <span
          style={{
            fontFamily: 'var(--rally-font-display)',
            fontWeight: 700,
            color: 'rgba(255,255,255,.22)',
          }}
        >
          {getCopy(themeId, 'tripPageShared.footer.brand')}
        </span>
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.08)', marginTop: 2, cursor: 'pointer' }}>
        {getCopy(themeId, 'tripPageShared.footer.ctaCreate')}
      </div>
    </div>
  );
}
