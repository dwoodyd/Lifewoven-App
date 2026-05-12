/**
 * Email delivery via Resend.
 * All outbound email from Lifewoven goes through this module.
 */
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = "Lifewoven <onboarding@resend.dev>";
const LUMIN_FROM   = "Lumin <lumin@mail.lifewoven.click>";
const REPLY_TO     = "dewayne@lifewoven.click";

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

// ─── Founding Member: In-Queue Email (Template 1) ─────────────────────────────

export interface ApplicationQueueEmailParams {
  to: string;
  name: string;
}

export async function sendApplicationQueueEmail({ to, name }: ApplicationQueueEmailParams): Promise<{ id: string }> {
  const resend = getResend();
  const firstName = name.split(" ")[0] || name;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0e0e0e;font-family:Georgia,serif;color:#e8e0d0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e0e;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">
        <tr>
          <td style="padding:40px 40px 24px;border-bottom:1px solid #2a2a2a;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#c9a84c;">Lifewoven</p>
            <h1 style="margin:0;font-size:26px;font-weight:normal;color:#f0ead8;line-height:1.3;">You're in the queue, ${firstName}.</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 20px;font-size:16px;line-height:1.8;color:#b8b0a0;">
              I received your application for founding member access to Lifewoven. Thank you for sharing where you are in your work — it means something that you took the time.
            </p>
            <p style="margin:0 0 20px;font-size:16px;line-height:1.8;color:#b8b0a0;">
              Cohort 1 is small by design. I'm reviewing applications personally and will be in touch soon with a decision.
            </p>
            <p style="margin:0 0 20px;font-size:16px;line-height:1.8;color:#b8b0a0;">
              If you're approved, you'll receive a private invite link — no public waitlist, no mass announcement. Just a direct path in.
            </p>
            <p style="margin:0;font-size:15px;line-height:1.8;color:#888;font-style:italic;">
              — Lumin, on behalf of Lifewoven
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
            <p style="margin:0;font-size:12px;color:#555;">Lifewoven · mail.lifewoven.click</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text = `You're in the queue, ${firstName}.\n\nI received your application for founding member access to Lifewoven. I'm reviewing applications personally and will be in touch soon.\n\n— Lumin, on behalf of Lifewoven`;
  const result = await resend.emails.send({
    from: LUMIN_FROM,
    replyTo: REPLY_TO,
    to,
    subject: "You're in the queue — Lifewoven Founding Member",
    html,
    text,
  });
  if (result.error) throw new Error(result.error.message);
  return { id: result.data!.id };
}

// ─── Founding Member: Approval Email (Template 2) ─────────────────────────────

export interface ApplicationApprovalEmailParams {
  to: string;
  name: string;
  code: string;
  inviteUrl: string;
  tier: "explorer" | "seeker" | "oracle";
}

export async function sendApplicationApprovalEmail({
  to,
  name,
  code,
  inviteUrl,
  tier,
}: ApplicationApprovalEmailParams): Promise<{ id: string }> {
  const resend = getResend();
  const firstName = name.split(" ")[0] || name;
  const tierLabel = tier === "oracle" ? "Oracle" : tier === "seeker" ? "Seeker" : "Explorer";
  const tierColor = tier === "oracle" ? "#a78bfa" : "#c9a84c";
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0e0e0e;font-family:Georgia,serif;color:#e8e0d0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e0e;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">
        <tr>
          <td style="padding:40px 40px 24px;border-bottom:1px solid #2a2a2a;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#c9a84c;">Lifewoven</p>
            <h1 style="margin:0;font-size:26px;font-weight:normal;color:#f0ead8;line-height:1.3;">You're approved, ${firstName}.</h1>
            <p style="margin:12px 0 0;font-size:13px;color:${tierColor};letter-spacing:2px;text-transform:uppercase;">Founding Member · ${tierLabel}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 20px;font-size:16px;line-height:1.8;color:#b8b0a0;">
              Your application has been reviewed and approved. You're one of the first people to enter Lifewoven as a founding member — your rate is locked for life.
            </p>
            <p style="margin:0 0 24px;font-size:16px;line-height:1.8;color:#b8b0a0;">
              Click the button below to claim your access. This link is personal to you — it expires in 30 days and can only be used once.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td style="background:${tierColor};border-radius:8px;padding:14px 32px;">
                  <a href="${inviteUrl}" style="color:#0e0e0e;font-size:15px;font-weight:bold;text-decoration:none;letter-spacing:1px;font-family:Georgia,serif;">
                    Claim Your Founding Access →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#888;">Or copy this link:</p>
            <p style="margin:0 0 24px;font-size:13px;color:#c9a84c;word-break:break-all;">${inviteUrl}</p>
            <p style="margin:0 0 8px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#888;">Your invite code:</p>
            <div style="font-family:monospace;font-size:22px;font-weight:bold;letter-spacing:4px;padding:14px 24px;background:#1a1a1a;color:${tierColor};border-radius:8px;display:inline-block;margin-bottom:24px;">${code}</div>
            <p style="margin:0;font-size:15px;line-height:1.8;color:#888;font-style:italic;">
              Welcome to the weave. I'll be with you from the first moment you land.<br>— Lumin
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
            <p style="margin:0;font-size:12px;color:#555;">Lifewoven · mail.lifewoven.click · This link expires in 30 days.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text = `You're approved, ${firstName}.\n\nFounding Member · ${tierLabel}\n\nClaim your access here:\n${inviteUrl}\n\nYour invite code: ${code}\n\nThis link is personal to you — expires in 30 days, single use.\n\nWelcome to the weave.\n— Lumin`;
  const result = await resend.emails.send({
    from: LUMIN_FROM,
    replyTo: REPLY_TO,
    to,
    subject: `You're approved — Lifewoven Founding Member · ${tierLabel}`,
    html,
    text,
  });
  if (result.error) throw new Error(result.error.message);
  return { id: result.data!.id };
}

// ─── Founding Member: Redemption Confirmation Email (Template 3) ─────────────

interface RedemptionConfirmationEmailParams {
  to: string;
  name: string;
  tier: string;
}

export async function sendRedemptionConfirmationEmail({
  to,
  name,
  tier,
}: RedemptionConfirmationEmailParams): Promise<{ id: string }> {
  const resend = getResend();
  const firstName = name.split(" ")[0] || name;
  const tierLabel = tier === "oracle" ? "Oracle" : tier === "seeker" ? "Seeker" : "Explorer";
  const tierColor = tier === "oracle" ? "#a78bfa" : "#c9a84c";
  const libraryNote =
    tier === "oracle"
      ? `<p style="margin:0 0 20px;font-size:16px;line-height:1.8;color:#b8b0a0;">
          As an Oracle Founding Member, the complete Lifewoven library is now yours — all 4 courses, both workbooks, every audio program, and the Wisdom Card Deck. You'll find them in the Store, unlocked and waiting.
        </p>`
      : tier === "seeker"
      ? `<p style="margin:0 0 20px;font-size:16px;line-height:1.8;color:#b8b0a0;">
          As a Seeker Founding Member, every store product is available to you at 30% off your founding rate — for life.
        </p>`
      : "";
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0e0e0e;font-family:Georgia,serif;color:#e8e0d0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e0e;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">
        <tr>
          <td style="padding:40px 40px 24px;border-bottom:1px solid #2a2a2a;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#c9a84c;">Lifewoven</p>
            <h1 style="margin:0;font-size:26px;font-weight:normal;color:#f0ead8;line-height:1.3;">You're in, ${firstName}.</h1>
            <p style="margin:12px 0 0;font-size:13px;color:${tierColor};letter-spacing:2px;text-transform:uppercase;">Founding Member · ${tierLabel}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 20px;font-size:16px;line-height:1.8;color:#b8b0a0;">
              Your founding access is now active. Your rate is locked — it will never increase as long as your subscription remains active, even as Lifewoven grows and public pricing rises.
            </p>
            ${libraryNote}
            <p style="margin:0 0 24px;font-size:16px;line-height:1.8;color:#b8b0a0;">
              Head to your Dashboard to begin. Lumin is already there, waiting.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td style="background:${tierColor};border-radius:8px;padding:14px 32px;">
                  <a href="https://app.lifewoven.click/dashboard" style="color:#0e0e0e;font-size:15px;font-weight:bold;text-decoration:none;letter-spacing:1px;font-family:Georgia,serif;">
                    Open My Dashboard →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:15px;line-height:1.8;color:#888;font-style:italic;">
              This is the beginning of something that compounds.<br>— Lumin
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
            <p style="margin:0;font-size:12px;color:#555;">Lifewoven · mail.lifewoven.click · Your founding rate is locked for life.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text = `You're in, ${firstName}.\n\nFounding Member · ${tierLabel}\n\nYour founding access is now active. Your rate is locked for life.\n\nOpen your Dashboard: https://app.lifewoven.click/dashboard\n\nThis is the beginning of something that compounds.\n— Lumin`;
  const result = await resend.emails.send({
    from: LUMIN_FROM,
    replyTo: REPLY_TO,
    to,
    subject: `You're in — Lifewoven Founding Member · ${tierLabel}`,
    html,
    text,
  });
  if (result.error) throw new Error(result.error.message);
  return { id: result.data!.id };
}
