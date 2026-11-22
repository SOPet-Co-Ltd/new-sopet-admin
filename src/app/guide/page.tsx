import Link from 'next/link';
import { HiBookOpen, HiBuildingStorefront, HiShieldCheck } from 'react-icons/hi2';
import { helpBasePath } from '@/lib/help/registry';

export const metadata = {
  title: 'คู่มืออย่างเป็นทางการ',
};

export default function GuideHubPage() {
  return (
    <div className="mx-auto max-w-3xl pb-8">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <HiBookOpen className="size-7" aria-hidden />
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink">คู่มือ SOPet</h1>
        <p className="mt-3 text-sm text-pretty text-muted-foreground sm:text-base">
          คู่มือการใช้งานอย่างเป็นทางการ อ่านได้โดยไม่ต้องเข้าสู่ระบบ เลือกบทบาทที่ต้องการเรียนรู้
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={helpBasePath('admin')}
          className="group rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-brand/40 hover:bg-brand/5"
        >
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <HiShieldCheck className="size-5" aria-hidden />
          </div>
          <h2 className="font-display text-lg font-semibold text-ink group-hover:text-brand">
            คู่มือผู้ดูแลระบบ
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            จัดการร้านค้า คำขอ การเงิน การค้นหา อีเมล และการตั้งค่าแพลตฟอร์ม
          </p>
        </Link>

        <Link
          href={helpBasePath('vendor')}
          className="group rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-brand/40 hover:bg-brand/5"
        >
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <HiBuildingStorefront className="size-5" aria-hidden />
          </div>
          <h2 className="font-display text-lg font-semibold text-ink group-hover:text-brand">
            คู่มือผู้ขาย
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            สินค้า คำสั่งซื้อ โปรโมชัน ทีมงาน รับเงิน และการตั้งค่าร้าน
          </p>
        </Link>
      </div>
    </div>
  );
}
