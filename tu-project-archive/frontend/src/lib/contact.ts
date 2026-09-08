/**
 * Central contact details for the whole site.
 *
 * Everything (Contact page, Navbar link, Footer, purchase panel) reads from
 * here, so changing a value here updates it everywhere.
 * Set a field to '' (or an empty array) to hide that channel automatically.
 */
export const CONTACT = {
  // One or more phone numbers (also used for tel: links). First = primary.
  phones: ['09761795292', '09967216095'],
  // Viber uses this number; set to '' to hide the Viber row.
  viber: '09761795292',
  // Telegram: a t.me link OR a phone number (we build the link either way).
  telegram: '@akokst',
  // Full Facebook page / Messenger URL, e.g. https://m.me/yourpage. '' hides it.
  messenger: '',
  // Contact email address. '' hides it.
  email: 'aungkhamoo60@gmail.com',
} as const;

/** Strip everything except digits and a leading + for use in links. */
function digits(s: string): string {
  return s.replace(/[^\d+]/g, '');
}

/**
 * Normalize a Myanmar local number (09xxxxxxxxx) to international +959xxxxxxxx
 * for app deep links (Viber/Telegram). Already-international numbers pass through.
 */
function toIntl(phone: string): string {
  const d = digits(phone);
  if (d.startsWith('+')) return d;
  if (d.startsWith('09')) return '+959' + d.slice(2);
  if (d.startsWith('959')) return '+' + d;
  return d;
}

/** Build a tel: href from a display phone number. */
export function telHref(phone: string): string {
  return `tel:${toIntl(phone)}`;
}

/** Build a Viber deep link from a phone number. */
export function viberHref(phone: string): string {
  return `viber://chat?number=${encodeURIComponent(toIntl(phone))}`;
}

/** Build a Telegram link from a t.me URL, @username, or a phone number. */
export function telegramHref(value: string): string {
  const v = value.trim();
  if (/^https?:\/\//.test(v)) return v;
  if (v.startsWith('@')) return `https://t.me/${v.slice(1)}`;
  // A phone number → t.me supports phone links via the +country format.
  return `https://t.me/${toIntl(v)}`;
}
