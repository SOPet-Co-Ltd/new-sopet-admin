'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { useVendorCustomer } from '@/hooks/useVendorCustomers';

export default function VendorCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: customer, isLoading, error } = useVendorCustomer(params.id);

  if (isLoading) return <p className="text-muted">กำลังโหลด...</p>;
  if (error || !customer) {
    return (
      <p className="text-danger" role="alert">
        {error instanceof Error ? error.message : 'ไม่พบลูกค้า'}
      </p>
    );
  }

  return (
    <div>
      <PageHeader
        title={customer.fullName || customer.phone}
        description="รายละเอียดลูกค้า (อ่านอย่างเดียว)"
        back={
          <Link
            href="/vendor/customers"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand"
          >
            <HiArrowLeft className="size-3.5" aria-hidden="true" />
            กลับรายการลูกค้า
          </Link>
        }
      />

      <div className="mb-4">
        <Badge status={customer.isVerified ? 'published' : 'draft'}>
          {customer.isVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
        </Badge>
      </div>

      <Card>
        <CardBody className="space-y-3 text-sm">
          <div>
            <p className="text-muted">เบอร์โทรศัพท์</p>
            <p className="font-medium text-ink">{customer.phone}</p>
          </div>
          {customer.email ? (
            <div>
              <p className="text-muted">อีเมล</p>
              <p className="font-medium text-ink">{customer.email}</p>
            </div>
          ) : null}
          {customer.fullName ? (
            <div>
              <p className="text-muted">ชื่อ-นามสกุล</p>
              <p className="font-medium text-ink">{customer.fullName}</p>
            </div>
          ) : null}
          {customer.createdAt ? (
            <div>
              <p className="text-muted">สมัครเมื่อ</p>
              <p className="font-medium text-ink">
                {new Date(customer.createdAt).toLocaleString('th-TH')}
              </p>
            </div>
          ) : null}
          {customer.lastLoginAt ? (
            <div>
              <p className="text-muted">เข้าสู่ระบบล่าสุด</p>
              <p className="font-medium text-ink">
                {new Date(customer.lastLoginAt).toLocaleString('th-TH')}
              </p>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
