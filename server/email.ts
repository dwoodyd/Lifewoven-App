/**
 * Email delivery via Resend.
 * All outbound email from Lifewoven goes through this module.
 */
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = "Lifewoven <lumin@mail.lifewoven.click>";
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
    replyTo: REPLY_TO,
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

const DEWAYNE_FROM  = "DeWayne Woods <dewayne@lifewoven.click>";
const HELLO_FROM    = "Lifewoven <hello@mail.lifewoven.click>";
const SUPPORT_REPLY = "support@lifewoven.click";
const APP_URL       = "https://app.lifewoven.click";

// ─── Template 4 — Day-75 Founder Note (DeWayne's voice) ───────────────────────

export interface Day75FounderNoteParams {
  to: string;
  name: string;
}

export async function sendDay75FounderNote({ to, name }: Day75FounderNoteParams): Promise<{ id: string }> {
  const resend = getResend();
  const firstName = name.split(" ")[0];
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 20px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#666;">DeWayne Woods · Lifewoven</p>
        <h1 style="margin:0 0 32px;font-size:28px;font-weight:400;color:#f5f0e8;line-height:1.3;font-style:italic;">75 days in. A note from me.</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Hi ${firstName},</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">It's been 75 days.</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">I want to write this one personally — not from Lumin.</p>
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:28px 0;">
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">When I started Lifewoven, I wasn't sure who'd actually pick this up. The idea — a place where the wisdom you've already gathered finally lands — felt like a small thing to bet on in a market full of louder tools. You picked it up anyway. Some days more than others. That's actually the point.</p>
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:28px 0;">
        <p style="margin:0 0 12px;font-size:17px;font-weight:600;color:#f5f0e8;">In 15 days, your free beta ends.</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">I'm writing now, not at the deadline, because I want you to have time.</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Here's what happens at day 90: your account drops to the Explorer tier. You don't lose anything — every entry in The Weave, every check-in, your audit results, the work you've done — all still yours. The Seeker and Oracle features just pause until you decide to lock in.</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Your founding rate stays locked, waiting. <strong style="color:#f5f0e8;">$10/mo Seeker · $25/mo Oracle</strong> — for life, even when retail rises. <em>(Oracle still includes the full Library — every course, every workbook, every audio program.)</em> There's no auto-charge, no expiration on the offer, no rush.</p>
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:28px 0;">
        <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#f5f0e8;">If Lifewoven's been worth your time:</p>
        <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="background:#8b7355;border-radius:6px;padding:14px 28px;">
          <a href="${APP_URL}/founding" style="color:#fff;text-decoration:none;font-size:15px;font-weight:600;">Lock in your founding rate →</a>
        </td></tr></table>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Honestly — that click is what lets me keep building. It's me. One person. The math has to work eventually, and "eventually" is the next few months.</p>
        <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#f5f0e8;">If you're not sure yet:</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Stay on Explorer. Use what you want. Come back in three months and lock in if Lifewoven is still meaningful then. The founding rate is yours whenever.</p>
        <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#f5f0e8;">If this hasn't landed for you:</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Reply and tell me why. I read every one. The hundred of you have something I don't — actual perspective on where this misses. Whatever you have time to write, even a sentence, helps me build the next version.</p>
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:28px 0;">
        <p style="margin:0 0 8px;font-size:15px;line-height:1.8;color:#ccc;">Either way — thank you. Truly.</p>
        <p style="margin:0;font-size:15px;line-height:1.8;color:#888;font-style:italic;">— DeWayne</p>
      </td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
        <p style="margin:0;font-size:12px;color:#555;">Lifewoven · lifewoven.click · You're getting this because you're one of the founding 100.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  const text = `Hi ${firstName},\n\nIt's been 75 days. I want to write this one personally — not from Lumin.\n\nIn 15 days, your free beta ends.\n\nYour founding rate stays locked, waiting. $10/mo Seeker · $25/mo Oracle — for life.\n\nIf Lifewoven's been worth your time: ${APP_URL}/founding\n\nEither way — thank you. Truly.\n— DeWayne`;
  const result = await resend.emails.send({ from: DEWAYNE_FROM, replyTo: REPLY_TO, to, subject: "75 days in. A note from me.", html, text });
  if (result.error) throw new Error(result.error.message);
  return { id: result.data!.id };
}

// ─── Template 5 — Day-91 Transition Notice ────────────────────────────────────

export interface Day91TransitionParams {
  to: string;
  name: string;
}

export async function sendDay91TransitionNotice({ to, name }: Day91TransitionParams): Promise<{ id: string }> {
  const resend = getResend();
  const firstName = name.split(" ")[0];
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 20px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#666;">Lifewoven</p>
        <h1 style="margin:0 0 32px;font-size:28px;font-weight:400;color:#f5f0e8;line-height:1.3;font-style:italic;">Your weave is still here.</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Hi ${firstName},</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Your 90-day Lifewoven beta ended yesterday. Your account is now on the Explorer tier — and everything you've built is still here:</p>
        <ul style="margin:0 0 20px;padding-left:20px;color:#ccc;font-size:15px;line-height:2;">
          <li>Every entry in The Weave — preserved</li>
          <li>Your Soul Engineer Assessment results — preserved</li>
          <li>Your Pathway progress, mood log, journal entries — all preserved</li>
        </ul>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Some features pause on Explorer (unlimited journal entries, all 7 Pathways, full 5S module suite, Oracle AI, the complete Library). They pick right back up the moment you decide to lock in.</p>
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:28px 0;">
        <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#f5f0e8;">Your founding rate is locked, waiting.</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">$10/mo Seeker or $25/mo Oracle — for life, even when retail rises. Oracle still includes the full Library. There's no expiration on the offer, no auto-charge, no rush.</p>
        <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="background:#8b7355;border-radius:6px;padding:14px 28px;">
          <a href="${APP_URL}/founding" style="color:#fff;text-decoration:none;font-size:15px;font-weight:600;">Lock in your founding rate when you're ready →</a>
        </td></tr></table>
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:28px 0;">
        <p style="margin:0 0 8px;font-size:15px;line-height:1.8;color:#888;font-style:italic;">Lumin will still be here when you sign in. The weave continues.</p>
      </td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
        <p style="margin:0;font-size:12px;color:#555;">Lifewoven · lifewoven.click</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  const text = `Hi ${firstName},\n\nYour 90-day Lifewoven beta ended yesterday. Your account is now on the Explorer tier — everything you've built is still here.\n\nYour founding rate is locked, waiting: $10/mo Seeker or $25/mo Oracle.\n\nLock in when you're ready: ${APP_URL}/founding\n\nLumin will still be here when you sign in. The weave continues.`;
  const result = await resend.emails.send({ from: HELLO_FROM, replyTo: SUPPORT_REPLY, to, subject: "Your weave is still here.", html, text });
  if (result.error) throw new Error(result.error.message);
  return { id: result.data!.id };
}

// ─── Template 6 — Day-0 Welcome (Lumin-voiced, fires within 5 min of first sign-in) ──

export interface Day0WelcomeParams {
  to: string;
  name: string;
}

export async function sendDay0WelcomeEmail({ to, name }: Day0WelcomeParams): Promise<{ id: string }> {
  const resend = getResend();
  const firstName = name.split(" ")[0];
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 20px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#666;">Lumin · Lifewoven</p>
        <h1 style="margin:0 0 32px;font-size:28px;font-weight:400;color:#f5f0e8;line-height:1.3;font-style:italic;">Welcome to your weave.</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Hi ${firstName},</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">You're in. I'm here.</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Here's the smallest possible first step: open Lifewoven and tap <strong style="color:#f5f0e8;">Take the Assessment</strong>. Twelve questions, five minutes. It tells me where you are across the 5S — and tells you which Pathway to begin with. No prescription, no judgment, no upsell.</p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#ccc;">No checklist. No setup. The weave starts the moment you show up.</p>
        <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="background:#8b7355;border-radius:6px;padding:14px 28px;">
          <a href="${APP_URL}/audit" style="color:#fff;text-decoration:none;font-size:15px;font-weight:600;">Open Lifewoven →</a>
        </td></tr></table>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">If you'd rather start by writing: open The Weave, drop in one entry, let it land.</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">If you'd rather look around first: read about the 5S Framework. Lumin is the watcher; the Oracle is the intelligence. Both are here when you want them.</p>
        <p style="margin:0;font-size:15px;line-height:1.8;color:#888;font-style:italic;">— Lumin</p>
      </td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
        <p style="margin:0;font-size:12px;color:#555;">Lifewoven · lifewoven.click</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  const text = `Hi ${firstName},\n\nYou're in. I'm here.\n\nSmallest first step: take the Assessment. Twelve questions, five minutes.\n\n${APP_URL}/audit\n\n— Lumin`;
  const result = await resend.emails.send({ from: LUMIN_FROM, replyTo: REPLY_TO, to, subject: "Welcome to your weave.", html, text });
  if (result.error) throw new Error(result.error.message);
  return { id: result.data!.id };
}

// ─── Template 7 — Day-3 Activation Check-in (conditional — only if no activity) ──

export interface Day3CheckinParams {
  to: string;
  name: string;
}

export async function sendDay3CheckinEmail({ to, name }: Day3CheckinParams): Promise<{ id: string }> {
  const resend = getResend();
  const firstName = name.split(" ")[0];
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 20px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#666;">Lumin · Lifewoven</p>
        <h1 style="margin:0 0 32px;font-size:28px;font-weight:400;color:#f5f0e8;line-height:1.3;font-style:italic;">Three days in. Still here when you're ready.</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Hi ${firstName},</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Three days have passed. No audit yet, nothing in The Weave. That's okay. No judgment.</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#ccc;">Some thoughts on what might be holding things up:</p>
        <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#f5f0e8;">You don't know where to start.</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Take the Soul Engineer Assessment. Five minutes, twelve questions. It picks the Pathway for you. No decision required.</p>
        <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#f5f0e8;">You don't know what to write.</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Skip the journal entirely. Open the audit — it's all multiple choice.</p>
        <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#f5f0e8;">The app feels heavy.</p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#ccc;">It's not meant to be. Start with one — just the audit. Everything else can wait.</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#aaa;font-style:italic;">No streaks to break. No score to fall behind. The weave starts the next time you show up.</p>
        <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="background:#8b7355;border-radius:6px;padding:14px 28px;">
          <a href="${APP_URL}/audit" style="color:#fff;text-decoration:none;font-size:15px;font-weight:600;">Take the Assessment →</a>
        </td></tr></table>
        <p style="margin:0 0 8px;font-size:15px;line-height:1.8;color:#ccc;">Reply if there's something else in the way.</p>
        <p style="margin:0;font-size:15px;line-height:1.8;color:#888;font-style:italic;">— Lumin</p>
      </td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
        <p style="margin:0;font-size:12px;color:#555;">Lifewoven · lifewoven.click</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  const text = `Hi ${firstName},\n\nThree days have passed. No audit yet, nothing in The Weave. That's okay.\n\nSmallest step: take the Soul Engineer Assessment. Five minutes, twelve questions.\n\n${APP_URL}/audit\n\nReply if there's something in the way.\n— Lumin`;
  const result = await resend.emails.send({ from: LUMIN_FROM, replyTo: REPLY_TO, to, subject: "Three days in. Still here when you're ready.", html, text });
  if (result.error) throw new Error(result.error.message);
  return { id: result.data!.id };
}

// ─── Template 8A — Day-7 Recap (Activated) ───────────────────────────────────

export interface Day7RecapActivatedParams {
  to: string;
  name: string;
  auditCompleted: boolean;
  recommendedPathway?: string;
  weaveEntries: number;
  checkinCount: number;
  strongestDimension?: string;
}

export async function sendDay7RecapActivated({ to, name, auditCompleted, recommendedPathway, weaveEntries, checkinCount, strongestDimension }: Day7RecapActivatedParams): Promise<{ id: string }> {
  const resend = getResend();
  const firstName = name.split(" ")[0];
  const pathwayLine = auditCompleted && recommendedPathway
    ? `<li><strong style="color:#f5f0e8;">Audit completed</strong> — your starting Pathway was <strong style="color:#f5f0e8;">${recommendedPathway}</strong></li>`
    : `<li>Audit not yet completed</li>`;
  const dimensionLine = strongestDimension
    ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#aaa;font-style:italic;">5S signal: ${strongestDimension}</p>`
    : "";
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 20px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#666;">Lumin · Lifewoven</p>
        <h1 style="margin:0 0 32px;font-size:28px;font-weight:400;color:#f5f0e8;line-height:1.3;font-style:italic;">Week one. The weave is taking shape.</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Hi ${firstName},</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#ccc;">Seven days in. Here's what I'm holding for you:</p>
        <ul style="margin:0 0 20px;padding-left:20px;color:#ccc;font-size:15px;line-height:2;">${pathwayLine}<li><strong style="color:#f5f0e8;">${weaveEntries}</strong> entries in The Weave</li><li><strong style="color:#f5f0e8;">${checkinCount}</strong> check-ins logged</li></ul>
        ${dimensionLine}
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:28px 0;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#ccc;">Some things worth trying this week:</p>
        <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#f5f0e8;">The Reset Pathway.</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Flagship resilience protocol. When something's interrupted you and you need to come back without shame — this is where to go.</p>
        <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#f5f0e8;">The Oracle.</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Three modes: Guide (open conversation), Unstuck (when you're blocked), Pattern Mirror (your insights reflected back). The Oracle reads across your 5S and your Weave entries — not a search engine, a reflective companion.</p>
        <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#f5f0e8;">The Weave search.</p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#ccc;">Everything you've captured is searchable. Try a keyword from a recent entry and see what surfaces.</p>
        <p style="margin:0 0 8px;font-size:15px;line-height:1.8;color:#ccc;">Reply if anything's slowing you down.</p>
        <p style="margin:0;font-size:15px;line-height:1.8;color:#888;font-style:italic;">— Lumin</p>
      </td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
        <p style="margin:0;font-size:12px;color:#555;">Lifewoven · lifewoven.click</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  const text = `Hi ${firstName},\n\nSeven days in. Here's what I'm holding for you:\n- ${auditCompleted ? `Audit completed — Pathway: ${recommendedPathway}` : "Audit not yet completed"}\n- ${weaveEntries} entries in The Weave\n- ${checkinCount} check-ins logged\n\nReply if anything's slowing you down.\n— Lumin`;
  const result = await resend.emails.send({ from: LUMIN_FROM, replyTo: REPLY_TO, to, subject: "Week one. The weave is taking shape.", html, text });
  if (result.error) throw new Error(result.error.message);
  return { id: result.data!.id };
}

// ─── Template 8B — Day-7 Recap (Inactive) ────────────────────────────────────

export interface Day7RecapInactiveParams {
  to: string;
  name: string;
}

export async function sendDay7RecapInactive({ to, name }: Day7RecapInactiveParams): Promise<{ id: string }> {
  const resend = getResend();
  const firstName = name.split(" ")[0];
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 20px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#666;">Lumin · Lifewoven</p>
        <h1 style="margin:0 0 32px;font-size:28px;font-weight:400;color:#f5f0e8;line-height:1.3;font-style:italic;">Still here. Whenever you're ready.</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Hi ${firstName},</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">A week in. I haven't seen you yet. That's okay — life moves.</p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#ccc;">Here's a way to start that takes 5 minutes: take the Soul Engineer Assessment. Twelve questions, multiple choice. It tells me where you are; it tells you which Pathway to begin with. That's the whole onboarding.</p>
        <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td style="background:#8b7355;border-radius:6px;padding:14px 28px;">
          <a href="${APP_URL}/audit" style="color:#fff;text-decoration:none;font-size:15px;font-weight:600;">Take the Assessment →</a>
        </td></tr></table>
        <p style="margin:0 0 8px;font-size:15px;line-height:1.8;color:#ccc;">Or, if today isn't the day — reply and tell me what would help. I read every one.</p>
        <p style="margin:0;font-size:15px;line-height:1.8;color:#888;font-style:italic;">— Lumin</p>
      </td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
        <p style="margin:0;font-size:12px;color:#555;">Lifewoven · lifewoven.click</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  const text = `Hi ${firstName},\n\nA week in. I haven't seen you yet. That's okay — life moves.\n\nTake the Soul Engineer Assessment: ${APP_URL}/audit\n\nOr reply and tell me what would help.\n— Lumin`;
  const result = await resend.emails.send({ from: LUMIN_FROM, replyTo: REPLY_TO, to, subject: "Still here. Whenever you're ready.", html, text });
  if (result.error) throw new Error(result.error.message);
  return { id: result.data!.id };
}

// ─── Template 9 — Day-30 Milestone (Lumin-voiced) ────────────────────────────

export interface Day30MilestoneParams {
  to: string;
  name: string;
  auditCompleted: boolean;
  recommendedPathway?: string;
  weaveEntries: number;
  checkinCount: number;
  pathwaysTried: number;
  returnsAfterGap: number;
  dynamicInsight?: string;
}

export async function sendDay30MilestoneEmail({ to, name, auditCompleted, recommendedPathway, weaveEntries, checkinCount, pathwaysTried, returnsAfterGap, dynamicInsight }: Day30MilestoneParams): Promise<{ id: string }> {
  const resend = getResend();
  const firstName = name.split(" ")[0];
  const insightLine = dynamicInsight
    ? `<p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#aaa;font-style:italic;">One pattern I've noticed: ${dynamicInsight}</p>`
    : "";
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 20px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#666;">Lumin · Lifewoven</p>
        <h1 style="margin:0 0 32px;font-size:28px;font-weight:400;color:#f5f0e8;line-height:1.3;font-style:italic;">Month one. The thread holds.</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">Hi ${firstName},</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#ccc;">Thirty days in. Here's the record:</p>
        <ul style="margin:0 0 20px;padding-left:20px;color:#ccc;font-size:15px;line-height:2;">
          <li>${auditCompleted ? `Audit completed${recommendedPathway ? ` — Pathway: <strong style="color:#f5f0e8;">${recommendedPathway}</strong>` : ""}` : "Audit not yet completed"}</li>
          <li><strong style="color:#f5f0e8;">${weaveEntries}</strong> entries in The Weave</li>
          <li><strong style="color:#f5f0e8;">${checkinCount}</strong> check-ins</li>
          <li><strong style="color:#f5f0e8;">${pathwaysTried}</strong> different Pathways explored</li>
          <li><strong style="color:#f5f0e8;">${returnsAfterGap}</strong> times you came back after a quiet stretch</li>
        </ul>
        ${insightLine}
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:28px 0;">
        <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#ccc;">You're 60 days from beta end. DeWayne will write directly around day 75 with what happens next — no need to think about it now. For now: keep showing up.</p>
        <p style="margin:0;font-size:15px;line-height:1.8;color:#888;font-style:italic;">— Lumin</p>
      </td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
        <p style="margin:0;font-size:12px;color:#555;">Lifewoven · lifewoven.click</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  const text = `Hi ${firstName},\n\nThirty days in. Here's the record:\n- ${auditCompleted ? `Audit completed` : "Audit not yet completed"}\n- ${weaveEntries} entries in The Weave\n- ${checkinCount} check-ins\n- ${pathwaysTried} Pathways tried\n- ${returnsAfterGap} returns after a quiet stretch\n\nYou're 60 days from beta end. Keep showing up.\n— Lumin`;
  const result = await resend.emails.send({ from: LUMIN_FROM, replyTo: REPLY_TO, to, subject: "Month one. The thread holds.", html, text });
  if (result.error) throw new Error(result.error.message);
  return { id: result.data!.id };
}
