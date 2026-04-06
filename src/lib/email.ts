import { Resend } from 'resend';

const FROM = 'Rally <onboarding@resend.dev>';

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendInviteEmail({
  to,
  recipientName,
  organizerName,
  tripName,
  tripTagline,
  destination,
  dateStr,
  coverImageUrl,
  shareUrl,
}: {
  to: string;
  recipientName: string | null;
  organizerName: string;
  tripName: string;
  tripTagline: string | null;
  destination: string | null;
  dateStr: string | null;
  coverImageUrl: string | null;
  shareUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) return { ok: false, error: 'RESEND_API_KEY not set' };

  const greeting = recipientName ? `Hey ${recipientName},` : 'Hey,';
  const subject = `${organizerName} invited you to ${tripName}`;
  const metaLine = [destination, dateStr].filter(Boolean).join(' · ');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0; padding:0; background:#f5f1ea; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#1a2a33;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ea; padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px; background:#fff; border-radius:18px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.08);">
          ${
            coverImageUrl
              ? `<tr><td><img src="${escapeAttr(coverImageUrl)}" alt="" width="560" style="display:block; width:100%; max-width:560px; height:240px; object-fit:cover;" /></td></tr>`
              : `<tr><td style="height:120px; background:linear-gradient(135deg,#1a3d4a,#2d6b5a,#3a8a7a);"></td></tr>`
          }
          <tr>
            <td style="padding:32px 36px;">
              <div style="font-size:11px; text-transform:uppercase; letter-spacing:2px; color:#7a8a90; margin-bottom:12px;">
                ${escapeHtml(organizerName)} invited you
              </div>
              <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size:34px; line-height:1.1; margin:0 0 8px; color:#122c35; font-weight:800;">
                ${escapeHtml(tripName)}
              </h1>
              ${
                tripTagline
                  ? `<p style="font-family: Georgia, serif; font-style:italic; color:#556b73; font-size:17px; margin:0 0 14px;">${escapeHtml(tripTagline)}</p>`
                  : ''
              }
              ${
                metaLine
                  ? `<p style="color:#556b73; font-size:14px; margin:0 0 28px;">${escapeHtml(metaLine)}</p>`
                  : ''
              }
              <p style="font-size:15px; line-height:1.6; color:#2a3a43; margin:0 0 28px;">
                ${escapeHtml(greeting)}<br><br>
                ${escapeHtml(organizerName)} is planning a trip and wants you there. Tap below to see the full plan, check the cost, and RSVP.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 8px;">
                <tr>
                  <td align="center" style="background:#122c35; border-radius:12px;">
                    <a href="${escapeAttr(shareUrl)}" style="display:inline-block; padding:16px 36px; color:#fff; text-decoration:none; font-weight:700; font-size:15px; letter-spacing:0.2px;">
                      See the trip →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-size:11px; color:#98a5ab; text-align:center; margin:24px 0 0;">
                Or copy this link:<br>
                <a href="${escapeAttr(shareUrl)}" style="color:#556b73; word-break:break-all;">${escapeHtml(shareUrl)}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px; border-top:1px solid #f0ece4; text-align:center;">
              <div style="font-family: Georgia, serif; font-size:13px; color:#98a5ab;">
                Made with <strong style="color:#556b73;">Rally</strong> — the group trip planner
              </div>
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

${organizerName} invited you to ${tripName}.
${metaLine ? metaLine + '\n' : ''}
See the trip and RSVP: ${shareUrl}

— Rally`;

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
