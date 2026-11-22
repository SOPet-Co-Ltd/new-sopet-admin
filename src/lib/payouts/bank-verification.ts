import type { BankAccountVerificationStatus } from '@/types';

export type BankVerificationInfo = {
  label: string;
  description: string;
  className: string;
  dotClassName: string;
};

export const BANK_VERIFICATION_INFO: Record<BankAccountVerificationStatus, BankVerificationInfo> = {
  unverified: {
    label: 'ยังไม่ได้ส่งบัญชีให้ตรวจสอบ',
    description: 'บันทึกบัญชีธนาคารในขั้นตอน 1 เพื่อส่งให้ทีม SOPET ตรวจสอบ',
    className: 'border-border bg-surface text-ink',
    dotClassName: 'bg-muted',
  },
  pending_review: {
    label: 'รอทีม SOPET ตรวจสอบบัญชี',
    description: 'ทีมงานกำลังตรวจสอบบัญชีธนาคารของคุณ — เมื่อผ่านแล้วจะขอรับเงินได้',
    className: 'border-warning-text/20 bg-warning-bg text-warning-text',
    dotClassName: 'bg-warning-text',
  },
  verified: {
    label: 'บัญชีผ่านการตรวจสอบแล้ว',
    description: 'สามารถขอรับเงินได้เมื่อมียอดถึงขั้นต่ำ',
    className: 'border-success-text/30 bg-success-bg text-success-text',
    dotClassName: 'bg-success-text',
  },
  rejected: {
    label: 'บัญชีไม่ผ่านการตรวจสอบ',
    description: 'แก้ไขบัญชีธนาคารในขั้นตอน 1 แล้วบันทึกใหม่เพื่อส่งตรวจสอบอีกครั้ง',
    className: 'border-danger/30 bg-danger-bg text-danger',
    dotClassName: 'bg-danger',
  },
};

export const BANK_VERIFICATION_LABELS: Record<BankAccountVerificationStatus, string> = {
  unverified: 'ยังไม่ได้ส่งตรวจสอบ',
  pending_review: 'รอตรวจสอบ',
  verified: 'ตรวจสอบแล้ว',
  rejected: 'ไม่ผ่านการตรวจสอบ',
};

export function resolveBankVerificationStatus(
  status?: string | null,
): BankAccountVerificationStatus {
  return status && status in BANK_VERIFICATION_INFO
    ? (status as BankAccountVerificationStatus)
    : 'unverified';
}
