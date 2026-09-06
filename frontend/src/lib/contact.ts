/**
 * Central contact details for the whole site.
 *
 * ⚠️ EDIT THESE PLACEHOLDER VALUES with your real contact info.
 * They are used by the Contact page, the Navbar link, the Footer, and the
 * purchase panel. Everything reads from here, so change once and it updates
 * everywhere. Leave a field as an empty string ('') to hide that channel.
 */
export const CONTACT = {
  // Phone number in international format (also used for tel: links).
  phone: '+95 9 000 000 000',
  // Viber uses the same number; set to '' to hide the Viber row.
  viber: '+95 9 000 000 000',
  // Full Facebook page / Messenger URL, e.g. https://m.me/yourpage
  messenger: 'https://m.me/your-page-username',
  // Telegram link or username link, e.g. https://t.me/yourusername
  telegram: 'https://t.me/your-username',
  // Contact email address.
  email: 'your-email@example.com',
} as const;

/** Build a tel: href from a display phone number (strips spaces/dashes). */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** Build a Viber deep link (viber://chat?number=...) from a phone number. */
export function viberHref(phone: string): string {
  return `viber://chat?number=${encodeURIComponent(phone.replace(/[^\d+]/g, ''))}`;
}
