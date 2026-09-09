/**
 * mailer.ts — optional transactional email. Follows the same graceful-degrade
 * pattern as the other optional integrations (Cloudinary, Gemini): when SMTP is
 * not configured the message is logged to the console instead of sent, so the
 * feature is a no-op in dev/test and never blocks or crashes a request.
 *
 * Sending is always best-effort and fire-and-forget from the caller's point of
 * view — a mail failure must never roll back a payment approval.
 */
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';

let transporter: Transporter | null = null;
let initialised = false;

function getTransporter(): Transporter | null {
  if (initialised) return transporter;
  initialised = true;
  if (!env.SMTP_HOST) {
    transporter = null;
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return transporter;
}

export interface MailMessage {
  to: string;
  subject: string;
  /** Plain-text body. An HTML version is derived automatically. */
  text: string;
}

/** True when real SMTP delivery is configured. */
export function mailConfigured(): boolean {
  return Boolean(env.SMTP_HOST);
}

/**
 * Send an email. Resolves to true when handed off to SMTP, false when it was
 * only logged (unconfigured) or delivery failed. Never throws.
 */
export async function sendMail(msg: MailMessage): Promise<boolean> {
  const tx = getTransporter();
  if (!tx) {
    // eslint-disable-next-line no-console
    console.log(`[mailer] (not configured) would email ${msg.to}: ${msg.subject}`);
    return false;
  }
  try {
    await tx.sendMail({
      from: env.MAIL_FROM || env.SMTP_USER,
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
      html: toHtml(msg.text),
    });
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[mailer] failed to email ${msg.to}:`, err instanceof Error ? err.message : err);
    return false;
  }
}

/** Fire-and-forget wrapper: send without awaiting, swallowing any error. */
export function sendMailAsync(msg: MailMessage): void {
  void sendMail(msg).catch(() => {});
}

/** Minimal, safe text→HTML: escape then wrap paragraphs. */
function toHtml(text: string): string {
  const esc = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const body = esc
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 12px">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');
  return `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:14px;line-height:1.6;color:#0f172a">${body}</div>`;
}
