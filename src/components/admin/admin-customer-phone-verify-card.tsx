'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useVerifyCustomerPhoneAsAdmin } from '@/hooks/useAdminCustomers';
import { getErrorMessage } from '@/lib/api/errors';

type AdminCustomerPhoneVerifyCardProps = {
  customerId: string;
  phone: string;
  isVerified: boolean;
};

export function AdminCustomerPhoneVerifyCard({
  customerId,
  phone,
  isVerified,
}: AdminCustomerPhoneVerifyCardProps) {
  const verifyPhoneMutation = useVerifyCustomerPhoneAsAdmin();
  const [confirmVerifyOpen, setConfirmVerifyOpen] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  if (isVerified) {
    return verificationMessage ? (
      <p className="text-sm text-muted-foreground" role="status">
        {verificationMessage}
      </p>
    ) : null;
  }

  async function handleManualVerify() {
    setVerificationMessage(null);
    try {
      await verifyPhoneMutation.mutateAsync(customerId);
      setVerificationMessage('ยืนยันเบอร์โทรศัพท์แล้ว');
      setConfirmVerifyOpen(false);
    } catch (err) {
      setVerificationMessage(getErrorMessage(err, 'ยืนยันเบอร์โทรศัพท์ไม่สำเร็จ'));
      setConfirmVerifyOpen(false);
    }
  }

  return (
    <>
      <Card className="border-warning-bg bg-warning-bg/40">
        <CardBody className="space-y-4">
          <div>
            <h2 className="font-display text-base font-semibold text-balance text-warning-text">
              ยังไม่ยืนยันเบอร์โทรศัพท์
            </h2>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              ลูกค้ายังไม่ได้ยืนยันเบอร์ <span className="font-medium text-ink">{phone}</span>{' '}
              ยืนยันด้วยตนเองได้จากที่นี่เมื่อตรวจสอบแล้วว่าเป็นเจ้าของบัญชีจริง
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-card"
            disabled={verifyPhoneMutation.isPending}
            onClick={() => setConfirmVerifyOpen(true)}
          >
            ยืนยันเบอร์โทรด้วยตนเอง
          </Button>
          {verificationMessage ? (
            <p className="text-sm text-muted-foreground" role="status">
              {verificationMessage}
            </p>
          ) : null}
        </CardBody>
      </Card>

      <Dialog open={confirmVerifyOpen} onOpenChange={setConfirmVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันเบอร์โทรด้วยตนเอง</DialogTitle>
            <DialogDescription>
              คุณต้องการยืนยันเบอร์ {phone} แทนลูกค้าหรือไม่? การดำเนินการนี้จะข้ามขั้นตอนยืนยันผ่าน
              OTP
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmVerifyOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              type="button"
              disabled={verifyPhoneMutation.isPending}
              aria-busy={verifyPhoneMutation.isPending}
              onClick={() => void handleManualVerify()}
            >
              {verifyPhoneMutation.isPending ? 'กำลังยืนยัน...' : 'ยืนยันเบอร์โทร'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
