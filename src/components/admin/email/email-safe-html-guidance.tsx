import { HiOutlineInformationCircle } from 'react-icons/hi2';

/** Static info panel of email-safe HTML rules (see UI Spec § EmailSafeHtmlGuidance). */
export function EmailSafeHtmlGuidance() {
  return (
    <div className="flex gap-3 rounded-lg border border-info-text/20 bg-info-bg px-4 py-3 text-sm text-info-text">
      <HiOutlineInformationCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <ul className="list-disc space-y-1 pl-4">
        <li>
          ใช้อย่างน้อยโครงสร้างตาราง (<code className="font-mono">&lt;table&gt;</code>) และสไตล์แบบ
          inline
        </li>
        <li>
          ห้ามใส่ <code className="font-mono">&lt;script&gt;</code>, ฟอร์มรีโมต หรือ HTML
          ที่ไม่ปลอดภัย — ระบบจะปฏิเสธหรือเตือนเมื่อบันทึก
        </li>
        <li>
          คอนเทนเนอร์ต้องมีช่อง <code className="font-mono">{'{{{content}}}'}</code>{' '}
          สำหรับแทรกเนื้อหาเทมเพลต
        </li>
      </ul>
    </div>
  );
}
