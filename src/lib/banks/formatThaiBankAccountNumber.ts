/**
 * Thai retail bank account display format: xxx-x-xxxxx-x (10 digits).
 * Extra digits (up to 15) append after the 10th without extra dashes.
 */

export const THAI_BANK_ACCOUNT_MAX_DIGITS = 15;
export const THAI_BANK_ACCOUNT_MIN_DIGITS = 10;

export function sanitizeBankAccountDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, THAI_BANK_ACCOUNT_MAX_DIGITS);
}

export function formatThaiBankAccountNumber(value: string): string {
  const digits = sanitizeBankAccountDigits(value);
  if (!digits) return '';

  const group1 = digits.slice(0, 3);
  const group2 = digits.slice(3, 4);
  const group3 = digits.slice(4, 9);
  const group4 = digits.slice(9, 10);
  const rest = digits.slice(10);

  let formatted = group1;
  if (group2) formatted += `-${group2}`;
  if (group3) formatted += `-${group3}`;
  if (group4) formatted += `-${group4}`;
  if (rest) formatted += rest;

  return formatted;
}
