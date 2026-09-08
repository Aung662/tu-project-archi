/**
 * Formatting helpers. Currency reads in Myanmar kyat (MMK).
 * Enum label maps now live in `@/lib/i18n` (bilingual { my, en }).
 */

// Myanmar kyat. Numerals stay Western digits with a trailing "MMK" suffix.
export const formatMMK = (amount: number) =>
  `${new Intl.NumberFormat('en-US').format(amount)} MMK`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });

/**
 * Extract the filename from a Content-Disposition header so downloads keep their
 * real name + extension (the backend sets this). Returns null if absent.
 */
export function filenameFromDisposition(header: string | null): string | null {
  if (!header) return null;
  const utf8 = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8) return decodeURIComponent(utf8[1]);
  const plain = header.match(/filename="?([^";]+)"?/i);
  return plain ? plain[1] : null;
}
