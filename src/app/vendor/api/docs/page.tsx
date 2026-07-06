'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { useIsStoreManager } from '@/hooks/useMembershipRole';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { StoreIdField } from '@/components/vendor/store-id-field';
import { GRAPHQL_URL } from '@/lib/config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? GRAPHQL_URL.replace(/\/graphql\/?$/, '');

export default function VendorApiDocsPage() {
  const storeId = useVendorStoreId();
  const { isManager, isLoading } = useIsStoreManager();

  if (isLoading) {
    return <p className="text-muted">กำลังโหลด...</p>;
  }

  if (!isManager) {
    return (
      <div>
        <PageHeader title="เอกสาร API" description="คู่มือการเชื่อมต่อ REST API" />
        <Card>
          <CardBody>
            <p className="text-sm text-muted">
              เฉพาะเจ้าของร้านหรือผู้จัดการเท่านั้นที่เข้าถึงเอกสาร API ได้
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const exampleStoreId = storeId ?? '{storeId}';
  const jsonExample = `{
  "name": "อาหารแมวออร์แกนิค 2kg",
  "description": "อาหารแมวเกรดพรีเมียม",
  "warning": "เก็บในที่แห้ง หลีกเลี่ยงแสงแดด",
  "expiryDate": "2026-12-31",
  "category": "อาหารแมว",
  "tags": ["ออร์แกนิค", "เกรดพรีเมียม"],
  "variants": [
    { "name": "รสชาติ", "values": ["ไก่", "ปลา"] },
    { "name": "ขนาด", "values": ["2kg"] }
  ],
  "variantItems": [
    { "sku": "CAT-ORG-2KG-CHK", "stock": 120, "price": 499, "options": { "รสชาติ": "ไก่", "ขนาด": "2kg" } },
    { "sku": "CAT-ORG-2KG-FISH", "stock": 80, "price": 519, "options": { "รสชาติ": "ปลา", "ขนาด": "2kg" } }
  ]
}`;
  const curlExample = `curl -X POST "${API_BASE_URL}/api/v1/stores/${exampleStoreId}/products" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '${jsonExample.replace(/\n/g, '\n  ')}'`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="เอกสาร API" description="คู่มือการเชื่อมต่อ REST API สำหรับร้านค้า" />
        <Button type="button" variant="outline" asChild>
          <Link href="/vendor/api">กลับไปจัดการ API Keys</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">การยืนยันตัวตน (Authentication)</h2>
        </CardHeader>
        <CardBody className="space-y-3 text-sm text-muted">
          <p>
            ส่ง API Key ในหัวข้อ HTTP{' '}
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-ink">
              Authorization
            </code>{' '}
            ในรูปแบบ Bearer token:
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink">
            Authorization: Bearer sopet_sk_...
          </pre>
          <p>
            สร้าง API Key ได้ที่หน้า{' '}
            <Link href="/vendor/api" className="text-primary underline">
              จัดการ API Keys
            </Link>
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">Base URL</h2>
        </CardHeader>
        <CardBody>
          <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-sm text-ink">
            {API_BASE_URL}
          </pre>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">Store ID</h2>
        </CardHeader>
        <CardBody>
          <StoreIdField description="รหัสร้านค้าที่กำลังใช้งาน ใช้แทน {storeId} ใน URL ของ API ด้านล่าง — ตัวอย่างในหน้านี้เติมรหัสจริงให้แล้ว" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">สร้างสินค้า</h2>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-ink">Endpoint</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink">
              POST /api/v1/stores/&#123;storeId&#125;/products
            </pre>
          </div>

          <div>
            <p className="mb-2 font-medium text-ink">Request Body</p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-muted">
                    <th className="px-4 py-2 font-medium">ฟิลด์</th>
                    <th className="px-4 py-2 font-medium">ประเภท</th>
                    <th className="px-4 py-2 font-medium">จำเป็น</th>
                    <th className="px-4 py-2 font-medium">คำอธิบาย</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">name</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ใช่</td>
                    <td className="px-4 py-2">ชื่อสินค้า</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">description</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ไม่</td>
                    <td className="px-4 py-2">รายละเอียด</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">warning</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ไม่</td>
                    <td className="px-4 py-2">คำเตือน</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">expiryDate</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ไม่</td>
                    <td className="px-4 py-2">วันหมดอายุ รูปแบบ YYYY-MM-DD (ISO 8601 date)</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">category</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ไม่</td>
                    <td className="px-4 py-2">
                      ชื่อหมวดหมู่ (ชื่อ ไม่ใช่รหัส) ต้องมีอยู่และได้รับการอนุมัติแล้วในระบบ
                      จับคู่แบบไม่สนตัวพิมพ์ใหญ่-เล็กตามชื่อที่ตรงกัน
                    </td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">tags</td>
                    <td className="px-4 py-2">string[]</td>
                    <td className="px-4 py-2">ไม่</td>
                    <td className="px-4 py-2">
                      รายชื่อแท็ก (ชื่อ ไม่ใช่รหัส) แต่ละรายการต้องมีอยู่และได้รับการอนุมัติแล้ว
                      จับคู่แบบไม่สนตัวพิมพ์ใหญ่-เล็ก
                    </td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">variants</td>
                    <td className="px-4 py-2">array</td>
                    <td className="px-4 py-2">ใช่</td>
                    <td className="px-4 py-2">
                      กลุ่มตัวเลือก (dimension) ต้องมีอย่างน้อย 1 กลุ่ม (ดูตารางด้านล่าง)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-ink">variantItems</td>
                    <td className="px-4 py-2">array</td>
                    <td className="px-4 py-2">ใช่</td>
                    <td className="px-4 py-2">
                      รายการที่ขายได้จริง (combination) ต้องมีอย่างน้อย 1 รายการ (ดูตารางด้านล่าง)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="mb-2 font-medium text-ink">ฟิลด์ใน variants[] (กลุ่มตัวเลือก)</p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-muted">
                    <th className="px-4 py-2 font-medium">ฟิลด์</th>
                    <th className="px-4 py-2 font-medium">ประเภท</th>
                    <th className="px-4 py-2 font-medium">จำเป็น</th>
                    <th className="px-4 py-2 font-medium">คำอธิบาย</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">name</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ใช่</td>
                    <td className="px-4 py-2">ชื่อกลุ่มตัวเลือก (dimension) เช่น &quot;สี&quot;</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-ink">values</td>
                    <td className="px-4 py-2">string[]</td>
                    <td className="px-4 py-2">ใช่</td>
                    <td className="px-4 py-2">
                      รายการค่าของกลุ่มนี้ เช่น{' '}
                      <code className="font-mono text-ink">{'["แดง", "น้ำเงิน"]'}</code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="mb-2 font-medium text-ink">
              ฟิลด์ใน variantItems[] (รายการที่ขายได้จริง)
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-muted">
                    <th className="px-4 py-2 font-medium">ฟิลด์</th>
                    <th className="px-4 py-2 font-medium">ประเภท</th>
                    <th className="px-4 py-2 font-medium">จำเป็น</th>
                    <th className="px-4 py-2 font-medium">คำอธิบาย</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">sku</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ใช่</td>
                    <td className="px-4 py-2">รหัส SKU ต้องไม่ซ้ำกัน</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">stock</td>
                    <td className="px-4 py-2">integer</td>
                    <td className="px-4 py-2">ใช่</td>
                    <td className="px-4 py-2">จำนวนสต็อก / คงคลัง (≥ 0)</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">price</td>
                    <td className="px-4 py-2">number</td>
                    <td className="px-4 py-2">ใช่</td>
                    <td className="px-4 py-2">ราคาต่อรายการ (บาท, ราคาเต็ม ≥ 0)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-ink">options</td>
                    <td className="px-4 py-2">object</td>
                    <td className="px-4 py-2">ใช่</td>
                    <td className="px-4 py-2">
                      ค่าที่เลือกจากทุกกลุ่มใน variants เช่น{' '}
                      <code className="font-mono text-ink">{'{ "สี": "แดง", "ขนาด": "S" }'}</code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4 text-muted">
            <p className="mb-2 font-medium text-ink">หมายเหตุสำคัญ</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong className="text-ink">โครงสร้างตัวเลือก 2 ระดับ:</strong>{' '}
                <code className="font-mono text-ink">variants</code> คือกลุ่มตัวเลือก (เช่น สี,
                ขนาด) ไม่มี sku/stock/ราคา; <code className="font-mono text-ink">variantItems</code>{' '}
                คือรายการที่ขายได้จริง เก็บ sku/stock/ราคา และเลือกค่าจากทุกกลุ่มใน{' '}
                <code className="font-mono text-ink">options</code>
              </li>
              <li>
                <strong className="text-ink">ราคาสินค้า (base price):</strong> คำนวณจาก variantItems
                ที่ราคาต่ำที่สุดโดยอัตโนมัติ — ไม่มีฟิลด์ basePrice
              </li>
              <li>
                <strong className="text-ink">สถานะสินค้า:</strong> สินค้าที่สร้างผ่าน API
                นี้จะถูกบันทึกเป็น <strong className="text-ink">ฉบับร่าง (draft)</strong> เสมอ —
                ต้องตรวจสอบและเผยแพร่จากหน้าผู้ดูแล
              </li>
              <li>
                <strong className="text-ink">รูปภาพ/สื่อ:</strong> ยังไม่รองรับการอัปโหลดรูปภาพ —
                API นี้ยังไม่สามารถอัปโหลดรูปภาพหรือสื่อได้
              </li>
              <li>
                <strong className="text-ink">หมวดหมู่และแท็ก:</strong> ใช้ชื่อ (ไม่ใช่รหัส)
                และต้องมีอยู่ในระบบแล้ว (ได้รับการอนุมัติ) API จะไม่สร้างให้อัตโนมัติ —
                ชื่อที่ไม่พบจะได้รับข้อผิดพลาด 400
              </li>
              <li>
                <strong className="text-ink">การจับคู่ชื่อ:</strong>{' '}
                หมวดหมู่และแท็กจับคู่แบบไม่สนตัวพิมพ์ใหญ่-เล็กตามชื่อที่ตรงกันทุกตัวอักษร
              </li>
              <li>
                <strong className="text-ink">expiryDate:</strong> ต้องเป็นรูปแบบ YYYY-MM-DD
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-2 font-medium text-ink">ตัวอย่าง JSON</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink whitespace-pre-wrap">
              {jsonExample}
            </pre>
          </div>

          <div>
            <p className="mb-2 font-medium text-ink">ตัวอย่าง cURL</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink whitespace-pre-wrap">
              {curlExample}
            </pre>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">รหัสข้อผิดพลาด (Error Codes)</h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-muted">
                  <th className="px-4 py-2 font-medium">HTTP</th>
                  <th className="px-4 py-2 font-medium">รหัส</th>
                  <th className="px-4 py-2 font-medium">ความหมาย</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2">401</td>
                  <td className="px-4 py-2 font-mono text-ink">INVALID_API_KEY</td>
                  <td className="px-4 py-2">
                    ไม่มี API Key, Key ไม่ถูกต้อง, ถูกยกเลิก หรือ Key ไม่ตรงกับร้านค้า
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2">403</td>
                  <td className="px-4 py-2 font-mono text-ink">STORE_SUSPENDED</td>
                  <td className="px-4 py-2">ร้านค้ายังไม่ได้รับการอนุมัติหรือถูกระงับ</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2">400</td>
                  <td className="px-4 py-2 font-mono text-ink">VALIDATION_ERROR</td>
                  <td className="px-4 py-2">ข้อมูล request ไม่ผ่านการตรวจสอบ</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2">400</td>
                  <td className="px-4 py-2 font-mono text-ink">VARIANTS_REQUIRED</td>
                  <td className="px-4 py-2">ไม่มีกลุ่มตัวเลือก (variants) หรือกลุ่มตัวเลือกว่าง</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2">400</td>
                  <td className="px-4 py-2 font-mono text-ink">VARIANT_ITEMS_REQUIRED</td>
                  <td className="px-4 py-2">
                    ไม่มีรายการที่ขายได้จริง (variantItems) หรือรายการว่าง
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2">400</td>
                  <td className="px-4 py-2 font-mono text-ink">INVALID_VARIANT_OPTIONS</td>
                  <td className="px-4 py-2">
                    options ของรายการไม่ครบทุกกลุ่ม หรือใช้ค่าที่ไม่ได้ประกาศไว้ใน variants
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2">400</td>
                  <td className="px-4 py-2 font-mono text-ink">CATEGORY_NOT_FOUND</td>
                  <td className="px-4 py-2">
                    ไม่พบชื่อหมวดหมู่ที่ระบุ หรือหมวดหมู่ยังไม่ได้รับการอนุมัติ
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2">400</td>
                  <td className="px-4 py-2 font-mono text-ink">TAG_NOT_FOUND</td>
                  <td className="px-4 py-2">
                    ไม่พบชื่อแท็กอย่างน้อยหนึ่งรายการ หรือแท็กยังไม่ได้รับการอนุมัติ (response
                    จะระบุชื่อที่ไม่พบ)
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2">400</td>
                  <td className="px-4 py-2 font-mono text-ink">SKU_EXISTS</td>
                  <td className="px-4 py-2">SKU ซ้ำกับที่มีอยู่แล้วในระบบ</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-muted">
            รูปแบบ response ข้อผิดพลาด:{' '}
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-ink">
              {'{ "success": false, "error": { "code": "...", "message": "..." } }'}
            </code>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
