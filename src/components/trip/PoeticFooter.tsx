// Trip-page-only footer ("rally is a doorway, not an app...").
// Every other surface uses globalCopy.footer.madeWith ("made with rally").
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

export function PoeticFooter({ themeId }: { themeId: ThemeId }) {
  return (
    <footer className="poetic-footer">
      {getCopy(themeId, 'tripPageShared.footer.poetic')}
    </footer>
  );
}
