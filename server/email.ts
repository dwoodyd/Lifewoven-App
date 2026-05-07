/**
 * Email delivery via Resend.
 * All outbound email from Lifewoven goes through this module.
 */
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = "Lifewoven <onboarding@resend.dev>";

function getResend(): Resend {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  return new Resend(RESEND_API_KEY);
}

export interface BetaInviteEmailParams {
  to: string;
  codes: string[];
  redeemUrl: string;
}

export async function sendBetaInviteEmail({
  to,
  codes,
  redeemUrl,
}: BetaInviteEmailParams): Promise<{ id: string }> {
  const resend = getResend();

  const codeLines = codes
    .map((c) => `<div style="font-family:monospace;font-size:20px;font-weight:bold;letter-spacing:4px;padding:12px 20px;background:#1a1a1a;color:#c9a84c;border-radius:8px;display:inline-block;margin:8px 0;">${c}</div>`)
    .join("\n");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0e0e0e;font-family:Georgia,serif;color:#e8e0d0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e0e;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">
        <!-- Header -->
        <tr>
          <td style="padding:40px 40px 24px;border-bottom:1px solid #2a2a2a;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#c9a84c;">Lifewoven</p>
            <h1 style="margin:0;font-size:28px;font-weight:normal;color:#f0ead8;line-height:1.3;">Your Beta Access Code</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#b8b0a0;">
              You've been personally invited to join the Lifewoven private beta — a platform for people who've read the books, done the work, and are ready to live it.
            </p>
            <p style="margin:0 0 8px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#888;">Your code${codes.length > 1 ? "s" : ""}:</p>
            ${codeLines}
            <p style="margin:24px 0 8px;font-size:14px;color:#888;">
              Each code grants <strong style="color:#c9a84c;">45 days of full access</strong> to all features — the Oracle, the 5S framework, pathways, and Lumin.
            </p>
            <div style="margin:28px 0;text-align:center;">
              <a href="${redeemUrl}" style="display:inline-block;padding:14px 32px;background:#c9a84c;color:#0e0e0e;text-decoration:none;border-radius:6px;font-size:15px;font-weight:bold;letter-spacing:1px;">Redeem Your Access →</a>
            </div>
            <p style="margin:0;font-size:13px;color:#666;line-height:1.6;">
              Or visit: <a href="${redeemUrl}" style="color:#c9a84c;">${redeemUrl}</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
            <p style="margin:0;font-size:12px;color:#555;font-style:italic;">Welcome to the journey. — The Lifewoven Team</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Your Lifewoven Beta Access Code\n\n${codes.join("\n")}\n\nRedeem at: ${redeemUrl}\n\nEach code grants 45 days of full access.\n\nWelcome to the journey.\n— The Lifewoven Team`;

  const result = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Your Lifewoven Beta Access Code",
    html,
    text,
  });

  if (result.error) throw new Error(result.error.message);
  return { id: result.data!.id };
}
