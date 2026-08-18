/**
 * Thai bank brand accent colors for payout account UI (no logos).
 * Hex values align with common Omise / Thai bank identity references.
 * Surfaces use app tokens — brand is only for a small accent badge.
 */
export type BankAccountTheme = {
  brand: string;
  /** Text/icon color on the brand badge (chosen for ≥4.5:1 on `brand`) */
  onBrand: string;
  /** Short code shown on the badge */
  shortCode: string;
};

const DEFAULT_THEME: BankAccountTheme = {
  brand: '#7348a8',
  onBrand: '#ffffff',
  shortCode: 'BANK',
};

const THEMES: Record<string, BankAccountTheme> = {
  bbl: { brand: '#1e4598', onBrand: '#ffffff', shortCode: 'BBL' },
  kbank: { brand: '#138f2d', onBrand: '#ffffff', shortCode: 'KBANK' },
  ktb: { brand: '#0d7ab5', onBrand: '#ffffff', shortCode: 'KTB' },
  bay: { brand: '#c99500', onBrand: '#171719', shortCode: 'BAY' },
  scb: { brand: '#4e2e7f', onBrand: '#ffffff', shortCode: 'SCB' },
  ttb: { brand: '#0050f0', onBrand: '#ffffff', shortCode: 'TTB' },
  gsb: { brand: '#c4126e', onBrand: '#ffffff', shortCode: 'GSB' },
  uob: { brand: '#0b3979', onBrand: '#ffffff', shortCode: 'UOB' },
  cimb: { brand: '#7e2f36', onBrand: '#ffffff', shortCode: 'CIMB' },
  kkp: { brand: '#5a547c', onBrand: '#ffffff', shortCode: 'KKP' },
  tisco: { brand: '#12549f', onBrand: '#ffffff', shortCode: 'TISCO' },
  lhb: { brand: '#5a5b5e', onBrand: '#ffffff', shortCode: 'LHB' },
  baac: { brand: '#3d7f18', onBrand: '#ffffff', shortCode: 'BAAC' },
  ghb: { brand: '#c45f12', onBrand: '#ffffff', shortCode: 'GHB' },
  ibank: { brand: '#1c8035', onBrand: '#ffffff', shortCode: 'IBANK' },
};

export function getBankAccountTheme(bankCode?: string | null): BankAccountTheme {
  if (!bankCode) return DEFAULT_THEME;
  return THEMES[bankCode] ?? DEFAULT_THEME;
}
