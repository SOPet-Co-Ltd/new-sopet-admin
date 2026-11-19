export const PAYOUT_STATUS_LABELS: Record<string, string> = {
  pending: 'รอดำเนินการ',
  processing: 'กำลังโอน',
  completed: 'สำเร็จ',
  failed: 'ล้มเหลว',
};

export const VENDOR_CANCELLED_PAYOUT_REASON = 'ร้านยกเลิกคำขอรับเงิน';

export function payoutStatusLabel(status: string, failureReason?: string | null): string {
  if (status === 'failed' && failureReason === VENDOR_CANCELLED_PAYOUT_REASON) {
    return 'ยกเลิกแล้ว';
  }
  return PAYOUT_STATUS_LABELS[status] ?? status;
}
