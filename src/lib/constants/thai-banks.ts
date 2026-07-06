/**
 * Thai banks commonly supported by Omise transfers/recipients.
 * `code` follows Omise's bank code convention (kept for a future `bankCode`
 * column / Omise Transfers integration); `name` is the Thai display name that
 * is currently persisted in the store's free-text `bankName` field.
 */
export interface ThaiBank {
  code: string;
  name: string;
}

export const THAI_BANKS: ThaiBank[] = [
  { code: 'bbl', name: 'ธนาคารกรุงเทพ' },
  { code: 'kbank', name: 'ธนาคารกสิกรไทย' },
  { code: 'ktb', name: 'ธนาคารกรุงไทย' },
  { code: 'bay', name: 'ธนาคารกรุงศรีอยุธยา' },
  { code: 'scb', name: 'ธนาคารไทยพาณิชย์' },
  { code: 'ttb', name: 'ธนาคารทหารไทยธนชาต' },
  { code: 'gsb', name: 'ธนาคารออมสิน' },
  { code: 'uob', name: 'ธนาคารยูโอบี' },
  { code: 'cimb', name: 'ธนาคารซีไอเอ็มบี ไทย' },
  { code: 'kkp', name: 'ธนาคารเกียรตินาคินภัทร' },
  { code: 'tisco', name: 'ธนาคารทิสโก้' },
  { code: 'lhb', name: 'ธนาคารแลนด์ แอนด์ เฮ้าส์' },
  { code: 'baac', name: 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร' },
  { code: 'ghb', name: 'ธนาคารอาคารสงเคราะห์' },
  { code: 'ibank', name: 'ธนาคารอิสลามแห่งประเทศไทย' },
];
