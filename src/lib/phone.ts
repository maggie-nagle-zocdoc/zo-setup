/** Strip to digits only (0-9). */
export function getPhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Format digits as US phone: (XXX) XXX-XXXX, or +1 (XXX) XXX-XXXX if 11 digits with leading 1. Max 11 digits. */
export function formatPhoneDisplay(value: string): string {
  const digits = getPhoneDigits(value);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits[0] === "1") {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/** Normalize input: strip non-digits and format for display. Use in onChange. */
export function formatPhoneInput(raw: string): string {
  const digits = getPhoneDigits(raw);
  return formatPhoneDisplay(digits);
}
