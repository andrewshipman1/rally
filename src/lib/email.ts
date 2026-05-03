import { Resend } from 'resend';
import { getCopy } from '@/lib/copy/get-copy';
import { getTheme } from '@/lib/themes';
import type { ThemeId, Templated } from '@/lib/themes/types';

const FROM = process.env.RESEND_FROM_EMAIL || 'Rally <onboarding@resend.dev>';

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function renderTemplated(t: Templated): string {
  return typeof t === 'string' ? t : t({});
}

export async function sendInviteEmail({
  to,
  recipientName,
  organizerName,
  tripName,
  tripTagline: _tripTagline,
  destination,
  dateStr,
  coverImageUrl: _coverImageUrl,
  shareUrl,
  themeId,
  daysOut,
}: {
  to: string;
  recipientName: string | null;
  organizerName: string;
  tripName: string;
  /** @deprecated 10G — hero is themed accent block; tagline not rendered. Param retained for caller compat. */
  tripTagline: string | null;
  destination: string | null;
  dateStr: string | null;
  /** @deprecated 10G — hero is themed accent block; image not rendered. Param retained for caller compat. */
  coverImageUrl: string | null;
  shareUrl: string;
  themeId: ThemeId;
  daysOut: number | null;
}): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) return { ok: false, error: 'RESEND_API_KEY not set' };

  const greeting = recipientName ? `hey ${recipientName},` : 'hey,';
  const subject = getCopy(themeId, 'emails.invite.subject', {
    organizer: organizerName,
    trip: tripName,
  });
  const bodyProse = getCopy(themeId, 'emails.invite.body', {
    organizer: organizerName,
    trip: tripName,
    n: daysOut ?? undefined,
  });
  const metaLine = [destination, dateStr].filter(Boolean).join(' · ');

  const theme = getTheme(themeId);
  const { bg, ink, accent, accent2, surface, onSurface, stickerBg, stroke } = theme.palette;
  const stickerInvite = renderTemplated(theme.strings.sticker.invite);
  const marqueeItems = theme.strings.marquee.map(renderTemplated);
  const marqueeTrack = [...marqueeItems, ...marqueeItems]
    .map(
      (item) =>
        `<span style="padding:0 14px; display:inline-flex; align-items:center; gap:14px;">${escapeHtml(item)}<span style="color:${accent}; padding-left:14px;">★</span></span>`,
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(subject)}</title>
  <style>@keyframes marquee-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }</style>
</head>
<body style="margin:0; padding:0; background:${bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:${ink};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg}; padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px; background:${bg}; border-radius:18px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:0;">
              <div style="background:${surface}; color:${stickerBg}; overflow:hidden; white-space:nowrap; padding:6px 0; border-bottom:2px solid ${surface};">
                <div style="display:inline-flex; font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif; font-weight:700; font-size:11px; letter-spacing:0.18em; animation:marquee-scroll 18s linear infinite;">${marqueeTrack}</div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:${accent}; padding:28px 22px 24px; color:${onSurface}; position:relative;">
              <!-- Sticker text color is hardcoded #1a1a1a (NOT theme stroke).
                   Contrast audit (10G, 2026-05-02): in 3 dark themes — festival-run,
                   boys-trip, city-weekend — chassis stroke = onSurface (light), which
                   on yellow stickerBg drops to 1.09–1.19:1. stickerBg is universally
                   yellow-leaning across all 17 themes, so dark text is universally safe. -->
              <span style="display:inline-block; background:${stickerBg}; color:#1a1a1a; font-family:Georgia,'Times New Roman',serif; font-weight:700; font-size:13px; padding:6px 12px; border-radius:999px; border:1.5px solid ${stroke}; transform:rotate(-2deg); margin-bottom:14px;">${escapeHtml(stickerInvite)}</span>
              <div style="font-size:11px; text-transform:uppercase; letter-spacing:1.6px; opacity:0.78; margin-bottom:10px; color:${onSurface};">
                ${escapeHtml(organizerName)} invited you
              </div>
              <h1 style="font-family:Georgia,'Times New Roman',serif; font-weight:800; font-size:30px; line-height:1.08; margin:0 0 6px; color:${onSurface};">
                ${escapeHtml(tripName)}
              </h1>
              ${
                metaLine
                  ? `<p style="font-size:13px; opacity:0.82; margin:0; color:${onSurface};">${escapeHtml(metaLine)}</p>`
                  : ''
              }
            </td>
          </tr>
          <tr>
            <td style="padding:24px 22px 8px; background:${bg}; color:${ink};">
              <p style="font-size:15px; line-height:1.6; color:${ink}; margin:0 0 12px;">${escapeHtml(greeting)}</p>
              <p style="font-size:15px; line-height:1.6; color:${ink}; margin:0 0 16px;">${escapeHtml(bodyProse)}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="text-align:center; padding:8px 22px 4px; background:${bg};">
              <a href="${escapeAttr(shareUrl)}" style="display:inline-block; background:${accent}; color:${onSurface}; text-decoration:none; padding:14px 30px; border-radius:12px; font-weight:700; font-size:15px; letter-spacing:0.2px; border:2px solid ${stroke};">
                see the trip →
              </a>
            </td>
          </tr>
          <tr>
            <td style="text-align:center; font-size:11px; color:${accent2}; padding:18px 22px 24px; background:${bg}; line-height:1.5;">
              or paste this link:<br>
              <a href="${escapeAttr(shareUrl)}" style="color:${accent2}; word-break:break-all;">${escapeHtml(shareUrl)}</a>
            </td>
          </tr>
          <tr>
            <td style="background:${surface}; color:${onSurface}; padding:16px 22px; text-align:center; font-family:Georgia,'Times New Roman',serif; font-size:13px; letter-spacing:0.3px;">
              rally <span style="color:${stickerBg}; margin:0 6px;">·</span> group trip planner
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `${greeting}

${bodyProse}
${metaLine ? metaLine + '\n' : ''}
See the trip and RSVP: ${shareUrl}

— rally — group trip planner`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'send failed' };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
