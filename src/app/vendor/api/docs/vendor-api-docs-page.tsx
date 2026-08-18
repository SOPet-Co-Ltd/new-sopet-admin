'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { useIsStoreManager } from '@/hooks/useMembershipRole';
import { useVendorStoreId } from '@/hooks/useVendorStoreId';
import { StoreIdField } from '@/components/vendor/store-id-field';

type VendorApiDocsPageProps = {
  apiBaseUrl: string;
};

export default function VendorApiDocsPage({ apiBaseUrl }: VendorApiDocsPageProps) {
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
  "petType": "แมว",
  "brand": "Royal Canin",
  "images": [
    "https://cdn.example.com/catalog/cat-food-1.jpg",
    "https://cdn.example.com/catalog/cat-food-2.jpg"
  ],
  "variants": [
    { "name": "รสชาติ", "values": ["ไก่", "ปลา"] },
    { "name": "ขนาด", "values": ["2kg"] }
  ],
  "variantItems": [
    { "sku": "CAT-ORG-2KG-CHK", "stock": 120, "price": 499, "options": { "รสชาติ": "ไก่", "ขนาด": "2kg" } },
    { "sku": "CAT-ORG-2KG-FISH", "stock": 80, "price": 519, "options": { "รสชาติ": "ปลา", "ขนาด": "2kg" } }
  ]
}`;
  const curlExample = `curl -X POST "${apiBaseUrl}/api/v1/stores/${exampleStoreId}/products" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '${jsonExample.replace(/\n/g, '\n  ')}'`;

  const listProductsCurl = `curl -X GET "${apiBaseUrl}/api/v1/stores/${exampleStoreId}/products?page=1&limit=20" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx"`;

  const getProductCurl = `curl -X GET "${apiBaseUrl}/api/v1/stores/${exampleStoreId}/products/{productId}" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx"`;

  const productPatchExample = `{
  "name": "อาหารแมวออร์แกนิค 2kg (อัปเดต)",
  "description": "รายละเอียดใหม่",
  "category": "อาหารแมว",
  "tags": ["ออร์แกนิค"],
  "petType": "แมว",
  "brand": "Royal Canin",
  "images": [
    "https://cdn.example.com/catalog/cat-food-1.jpg"
  ]
}`;
  const productPatchCurl = `curl -X PATCH "${apiBaseUrl}/api/v1/stores/${exampleStoreId}/products/{productId}" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '${productPatchExample.replace(/\n/g, '\n  ')}'`;

  const variantPatchExample = `{
  "stock": 100,
  "price": 529
}`;
  const variantByIdCurl = `curl -X PATCH "${apiBaseUrl}/api/v1/stores/${exampleStoreId}/products/{productId}/variants/{variantId}" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '${variantPatchExample.replace(/\n/g, '\n  ')}'`;
  const variantBySkuCurl = `curl -X PATCH "${apiBaseUrl}/api/v1/stores/${exampleStoreId}/variants/by-sku/CAT-ORG-2KG-CHK" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '${variantPatchExample.replace(/\n/g, '\n  ')}'`;

  const createResponseExample = `{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "storeId": "${exampleStoreId}",
  "name": "อาหารแมวออร์แกนิค 2kg",
  "status": "draft",
  "variants": [
    { "id": "…", "sku": "CAT-ORG-2KG-CHK", "stockQuantity": 120, "price": 499 }
  ]
}`;

  const deleteProductCurl = `curl -X DELETE "${apiBaseUrl}/api/v1/stores/${exampleStoreId}/products/{productId}" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx"`;

  const webhookPutExample = `{
  "url": "https://example.com/hooks/sopet",
  "events": [
    "order.create",
    "order.payment_failed",
    "order.paid",
    "order.processing",
    "order.on_hold",
    "order.shipped",
    "order.delivered",
    "order.cancelled",
    "order.refunded"
  ],
  "enabled": true,
  "rotateSecret": false
}`;
  const webhookPutCurl = `curl -X PUT "${apiBaseUrl}/api/v1/stores/${exampleStoreId}/webhook" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '${webhookPutExample.replace(/\n/g, '\n  ')}'`;

  const trackingExample = `{
  "trackingNumber": "TH123456789",
  "fulfillmentProvider": "Kerry",
  "trackingUrl": "https://th.kerryexpress.com/track/TH123456789"
}`;
  const trackingCurl = `curl -X PATCH "${apiBaseUrl}/api/v1/stores/${exampleStoreId}/orders/{orderId}/tracking" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '${trackingExample.replace(/\n/g, '\n  ')}'`;

  const webhookPayloadExample = `{
  "id": "evt_…",
  "event": "order.paid",
  "createdAt": "2026-08-05T04:00:00.000Z",
  "storeId": "${exampleStoreId}",
  "data": {
    "orderId": "…",
    "orderNumber": "ORD-…",
    "status": "paid",
    "paymentMethod": "promptpay",
    "paidAt": "2026-08-05T04:00:00.000Z",
    "currency": "THB",
    "customer": { "name": "สมชาย", "phone": "0812345678", "email": null },
    "shippingAddress": { "fullName": "สมชาย", "phone": "0812345678", "addressLine1": "…", "amphoe": "…", "province": "…", "postalCode": "…" },
    "items": [
      {
        "id": "…",
        "productName": "อาหารแมว",
        "sku": "CAT-ORG-2KG-CHK",
        "variantId": "…",
        "quantity": 1,
        "unitPrice": 499,
        "subtotal": 499,
        "fulfillmentStatus": "pending"
      }
    ],
    "itemsSubtotal": 499
  }
}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="เอกสาร API" description="คู่มือการเชื่อมต่อ REST API สำหรับร้านค้า" />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/vendor/api">กลับไปจัดการ API Keys</Link>
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/vendor/api/llms.txt">llms.txt</Link>
          </Button>
        </div>
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
            {apiBaseUrl}
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
          <h2 className="font-display font-medium text-ink">ดูรายการสินค้า</h2>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-ink">Endpoint</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink">
              GET /api/v1/stores/&#123;storeId&#125;/products
            </pre>
          </div>
          <div>
            <p className="mb-2 font-medium text-ink">Query parameters (ไม่บังคับ)</p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-muted">
                    <th className="px-4 py-2 font-medium">ฟิลด์</th>
                    <th className="px-4 py-2 font-medium">ประเภท</th>
                    <th className="px-4 py-2 font-medium">คำอธิบาย</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">page</td>
                    <td className="px-4 py-2">integer</td>
                    <td className="px-4 py-2">หน้า (เริ่มที่ 1, ค่าเริ่มต้น 1)</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">limit</td>
                    <td className="px-4 py-2">integer</td>
                    <td className="px-4 py-2">จำนวนต่อหน้า (ค่าเริ่มต้น 20, สูงสุด 100)</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">status</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">
                      กรองสถานะ: draft / published / archived — ไม่ส่ง = ทุกสถานะของร้านนี้
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-ink">search</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ค้นหาจากชื่อสินค้า</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <p className="font-medium text-ink">Success</p>
            <p className="mt-1 text-muted">
              200 พร้อม <span className="font-mono text-ink">items</span>{' '}
              (รูปแบบเดียวกับสร้างสินค้า) และ <span className="font-mono text-ink">pagination</span>
            </p>
          </div>
          <div>
            <p className="font-medium text-ink">ตัวอย่าง curl</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink whitespace-pre-wrap">
              {listProductsCurl}
            </pre>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">ดูรายละเอียดสินค้า</h2>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-ink">Endpoint</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink">
              GET /api/v1/stores/&#123;storeId&#125;/products/&#123;productId&#125;
            </pre>
          </div>
          <div>
            <p className="font-medium text-ink">Success</p>
            <p className="mt-1 text-muted">
              200 พร้อม object สินค้า (รูปแบบเดียวกับสร้างสินค้า) — 404 PRODUCT_NOT_FOUND
              ถ้าไม่มีหรือคนละร้าน
            </p>
          </div>
          <div>
            <p className="font-medium text-ink">ตัวอย่าง curl</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink whitespace-pre-wrap">
              {getProductCurl}
            </pre>
          </div>
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
                    <td className="px-4 py-2 font-mono text-ink">petType</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ไม่</td>
                    <td className="px-4 py-2">
                      ชื่อประเภทสัตว์เลี้ยง (ชื่อ ไม่ใช่รหัส) เช่น &quot;แมว&quot; หรือ
                      &quot;สุนัข&quot; ต้องมีอยู่และได้รับการอนุมัติแล้วในระบบ
                      จับคู่แบบไม่สนตัวพิมพ์ใหญ่-เล็ก (จำเป็นสำหรับการเผยแพร่สินค้า)
                    </td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">brand</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ไม่</td>
                    <td className="px-4 py-2">
                      ชื่อแบรนด์ (ชื่อ ไม่ใช่รหัส) ต้องมีอยู่และได้รับการอนุมัติแล้วในระบบ
                      จับคู่แบบไม่สนตัวพิมพ์ใหญ่-เล็ก
                    </td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">images</td>
                    <td className="px-4 py-2">string[]</td>
                    <td className="px-4 py-2">ไม่</td>
                    <td className="px-4 py-2">
                      URL รูปภาพ (http/https) สูงสุด 10 รูป แต่ละไฟล์ไม่เกิน 5 MB
                      (jpeg/png/webp/gif) — เซิร์ฟเวอร์จะดาวน์โหลดแล้วเก็บใน storage ไม่บันทึก URL
                      ต้นทาง รูปแรกเป็นรูปปก หาก URL ใดล้มเหลวทั้งคำขอจะล้มเหลว
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
                <strong className="text-ink">รูปภาพ (images):</strong> ส่งเป็น URL ได้ (ไม่บังคับ)
                ระบบจะดาวน์โหลดรูป แปลงเป็น WebP แล้วเก็บใน object storage —{' '}
                <strong className="text-ink">ไม่บันทึก URL ต้นทาง</strong> สูงสุด 10 รูป /
                ไฟล์ละไม่เกิน 5 MB (jpeg, png, webp, gif) รูปแรกเป็นรูปปก
                หากดาวน์โหลดหรือตรวจสอบรูปใดไม่ผ่าน ทั้งคำขอ create จะล้มเหลว (HTTP 400)
              </li>
              <li>
                <strong className="text-ink">หมวดหมู่ แท็ก ประเภทสัตว์เลี้ยง และแบรนด์:</strong>{' '}
                ใช้ชื่อ (ไม่ใช่รหัส) และต้องมีอยู่ในระบบแล้ว (ได้รับการอนุมัติ) API
                จะไม่สร้างให้อัตโนมัติ — ชื่อที่ไม่พบจะได้รับข้อผิดพลาด 400
              </li>
              <li>
                <strong className="text-ink">การจับคู่ชื่อ:</strong> หมวดหมู่ แท็ก ประเภทสัตว์เลี้ยง
                และแบรนด์ จับคู่แบบไม่สนตัวพิมพ์ใหญ่-เล็กตามชื่อที่ตรงกันทุกตัวอักษร
              </li>
              <li>
                <strong className="text-ink">ประเภทสัตว์เลี้ยง (petType):</strong>{' '}
                ไม่บังคับตอนสร้างสินค้า แต่จำเป็นสำหรับการเผยแพร่ — ควรระบุตอน import
                เพื่อให้เผยแพร่ได้โดยไม่ต้องแก้ไขเพิ่ม
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

          <div>
            <p className="mb-2 font-medium text-ink">Response (201) — เก็บรหัสสินค้าจากฟิลด์ id</p>
            <p className="mb-2 text-muted">
              คำขอสำเร็จคืนสินค้าทั้งก้อน รวมถึง{' '}
              <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-ink">id</code> (UUID)
              ของสินค้าและของแต่ละ variant — ใช้ id นี้สำหรับ PATCH / DELETE ต่อไป
            </p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink whitespace-pre-wrap">
              {createResponseExample}
            </pre>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">ลบสินค้า</h2>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-ink">Endpoint</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink">
              DELETE /api/v1/stores/&#123;storeId&#125;/products/&#123;productId&#125;
            </pre>
          </div>
          <p className="text-muted">
            Soft delete สินค้าในร้านนี้ (เหมือนการลบในแดชบอร์ด) — สำเร็จคืน HTTP{' '}
            <code className="font-mono text-ink">204</code> ไม่มี body
            หากไม่พบหรือไม่ใช่สินค้าร้านนี้ ได้{' '}
            <code className="font-mono text-ink">404 PRODUCT_NOT_FOUND</code>
          </p>
          <div>
            <p className="mb-2 font-medium text-ink">ตัวอย่าง cURL</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink whitespace-pre-wrap">
              {deleteProductCurl}
            </pre>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">Webhook ออเดอร์ (Automation)</h2>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <p className="text-muted">
            ตั้ง URL รับอีเวนต์ตลอดวงจรออเดอร์ (สร้าง → ชำระเงิน → จัดส่ง → ส่งมอบ / ยกเลิก) —
            payload มีเฉพาะรายการของร้านคุณ เหมาะกับ n8n / Zapier / ERP
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-muted">
                  <th className="px-4 py-2 font-medium">อีเวนต์</th>
                  <th className="px-4 py-2 font-medium">เมื่อไหร่</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2 font-mono text-ink">order.create</td>
                  <td className="px-4 py-2">ลูกค้าสร้างออเดอร์ (ยังไม่ชำระ / รอชำระ)</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2 font-mono text-ink">order.payment_failed</td>
                  <td className="px-4 py-2">
                    การชำระเงินล้มเหลว / QR หมดอายุ (ออเดอร์ยัง pending_payment ให้ลองใหม่ได้)
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2 font-mono text-ink">order.paid</td>
                  <td className="px-4 py-2">ชำระเงินสำเร็จ — พร้อมแพ็กของ</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2 font-mono text-ink">order.processing</td>
                  <td className="px-4 py-2">ร้านรับออเดอร์ / กำลังจัดเตรียม</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2 font-mono text-ink">order.on_hold</td>
                  <td className="px-4 py-2">ออเดอร์ถูกพัก (เช่น ร้านถูกระงับ)</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2 font-mono text-ink">order.shipped</td>
                  <td className="px-4 py-2">จัดส่งแล้ว (มี tracking)</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2 font-mono text-ink">order.delivered</td>
                  <td className="px-4 py-2">ลูกค้ายืนยันได้รับสินค้า</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2 font-mono text-ink">order.cancelled</td>
                  <td className="px-4 py-2">ออเดอร์ถูกยกเลิก</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-ink">order.refunded</td>
                  <td className="px-4 py-2">ออเดอร์ถูกคืนเงิน</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <p className="font-medium text-ink">Endpoints</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink whitespace-pre-wrap">
              {`PUT    /api/v1/stores/{storeId}/webhook
GET    /api/v1/stores/{storeId}/webhook
DELETE /api/v1/stores/{storeId}/webhook`}
            </pre>
          </div>
          <div>
            <p className="mb-2 font-medium text-ink">Request Body (PUT)</p>
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
                    <td className="px-4 py-2 font-mono text-ink">url</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ใช่</td>
                    <td className="px-4 py-2">HTTPS URL ที่จะรับ POST</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">events</td>
                    <td className="px-4 py-2">string[]</td>
                    <td className="px-4 py-2">ไม่</td>
                    <td className="px-4 py-2">
                      ค่าที่รองรับทั้งหมดด้านบน — ไม่ส่ง = สมัครครบทุกอีเวนต์
                    </td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">enabled</td>
                    <td className="px-4 py-2">boolean</td>
                    <td className="px-4 py-2">ไม่</td>
                    <td className="px-4 py-2">เปิด/ปิดการส่ง (ค่าเริ่มต้น true)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-ink">rotateSecret</td>
                    <td className="px-4 py-2">boolean</td>
                    <td className="px-4 py-2">ไม่</td>
                    <td className="px-4 py-2">
                      true = สร้าง secret ใหม่ (คืนใน response ครั้งเดียว)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4 text-muted">
            <p className="mb-2 font-medium text-ink">การยืนยัน webhook</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Header <code className="font-mono text-ink">X-Sopet-Event</code> — ชื่ออีเวนต์
              </li>
              <li>
                Header <code className="font-mono text-ink">X-Sopet-Delivery-Id</code> — รหัสการส่ง
              </li>
              <li>
                Header <code className="font-mono text-ink">X-Sopet-Signature</code> —{' '}
                <code className="font-mono text-ink">sha256=&lt;hmac_hex&gt;</code> ของ raw body
                ด้วย signing secret
              </li>
              <li>secret แสดงครั้งเดียวตอนสร้างหรือ rotate — เก็บไว้ฝั่งคุณ</li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-medium text-ink">ตัวอย่าง payload ที่ SOPET ส่งมา</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink whitespace-pre-wrap">
              {webhookPayloadExample}
            </pre>
          </div>
          <div>
            <p className="mb-2 font-medium text-ink">ตัวอย่าง cURL (ตั้งค่า webhook)</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink whitespace-pre-wrap">
              {webhookPutCurl}
            </pre>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">
            นำเข้ารีวิวสินค้า (Unknown customer)
          </h2>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-ink">Endpoint</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink">
              POST /api/v1/stores/&#123;storeId&#125;/products/&#123;productId&#125;/reviews
            </pre>
          </div>
          <p className="text-muted">
            สร้างรีวิวแบบนำเข้า — สถานะเริ่มต้น <code className="font-mono text-ink">pending</code>{' '}
            ต้องให้อดมินอนุมัติก่อนถึงจะแสดงบน storefront เป็นชื่อ{' '}
            <code className="font-mono text-ink">ลูกค้าไม่ระบุชื่อ</code> (ไม่ผูกลูกค้า/ออเดอร์จริง)
          </p>
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
                    <td className="px-4 py-2 font-mono text-ink">rating</td>
                    <td className="px-4 py-2">integer</td>
                    <td className="px-4 py-2">ใช่</td>
                    <td className="px-4 py-2">คะแนน 1–5</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">comment</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ไม่</td>
                    <td className="px-4 py-2">ข้อความรีวิว (≤ 2000)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-ink">images</td>
                    <td className="px-4 py-2">string[]</td>
                    <td className="px-4 py-2">ไม่</td>
                    <td className="px-4 py-2">URL รูป HTTPS สูงสุด 5 รูป</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <p className="mb-2 font-medium text-ink">ตัวอย่าง cURL</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink whitespace-pre-wrap">
              {`curl -X POST "${apiBaseUrl}/api/v1/stores/${exampleStoreId}/products/{productId}/reviews" \\
  -H "Authorization: Bearer sopet_sk_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"rating":5,"comment":"สินค้าดีมาก"}'`}
            </pre>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">อัปเดต Tracking / สถานะจัดส่ง</h2>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-ink">Endpoint</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink">
              PATCH /api/v1/stores/&#123;storeId&#125;/orders/&#123;orderId&#125;/tracking
            </pre>
          </div>
          <p className="text-muted">
            ใส่เลขพัสดุและผู้ให้บริการขนส่ง — หากรายการยังเป็น pending ระบบจะ acknowledge
            ให้อัตโนมัติแล้วเปลี่ยนเป็น shipped หากจัดส่งแล้ว สามารถอัปเดตเลขพัสดุได้
          </p>
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
                    <td className="px-4 py-2 font-mono text-ink">trackingNumber</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ใช่</td>
                    <td className="px-4 py-2">เลขพัสดุ (≤ 100 ตัวอักษร)</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">fulfillmentProvider</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ใช่</td>
                    <td className="px-4 py-2">ชื่อผู้ให้บริการ เช่น Kerry, Flash</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-ink">trackingUrl</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ไม่</td>
                    <td className="px-4 py-2">ลิงก์ติดตาม HTTPS (ถ้ามี)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <p className="mb-2 font-medium text-ink">ตัวอย่าง cURL</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink whitespace-pre-wrap">
              {trackingCurl}
            </pre>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">แก้ไขข้อมูลสินค้า</h2>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-ink">Endpoint</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink">
              PATCH /api/v1/stores/&#123;storeId&#125;/products/&#123;productId&#125;
            </pre>
          </div>
          <p className="text-muted">
            แก้ไขเฉพาะข้อมูลทั่วไปของสินค้า (ชื่อ รายละเอียด หมวดหมู่ แท็ก ประเภทสัตว์เลี้ยง แบรนด์
            รูปภาพ ฯลฯ) — ไม่ใช้แก้สต็อกหรือราคา (ดู endpoint ตัวแปรด้านล่าง)
          </p>
          <div>
            <p className="mb-2 font-medium text-ink">
              Request Body (ทุกฟิลด์ไม่บังคับ ต้องมีอย่างน้อย 1 ฟิลด์)
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-muted">
                    <th className="px-4 py-2 font-medium">ฟิลด์</th>
                    <th className="px-4 py-2 font-medium">ประเภท</th>
                    <th className="px-4 py-2 font-medium">คำอธิบาย</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">name</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ชื่อสินค้า</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">description</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">รายละเอียด</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">warning</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">คำเตือน</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">expiryDate</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">วันหมดอายุ YYYY-MM-DD</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">category</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ชื่อหมวดหมู่ (ต้องอนุมัติแล้ว)</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">tags</td>
                    <td className="px-4 py-2">string[]</td>
                    <td className="px-4 py-2">รายชื่อแท็ก (แทนที่ชุดเดิมทั้งชุดเมื่อส่ง)</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">petType</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ชื่อประเภทสัตว์เลี้ยง</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">brand</td>
                    <td className="px-4 py-2">string</td>
                    <td className="px-4 py-2">ชื่อแบรนด์</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-ink">images</td>
                    <td className="px-4 py-2">string[]</td>
                    <td className="px-4 py-2">
                      แทนที่ชุดรูปทั้งหมดเมื่อส่ง (กฎเดียวกับตอนสร้าง)
                      ส่งอาร์เรย์ว่างเพื่อลบรูปทั้งหมด ไม่ส่ง = คงรูปเดิม
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <p className="mb-2 font-medium text-ink">ตัวอย่าง cURL</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink whitespace-pre-wrap">
              {productPatchCurl}
            </pre>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">
            แก้ไขสต็อก / ราคาของตัวแปร (Variant)
          </h2>
        </CardHeader>
        <CardBody className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-ink">Endpoint (ระบุด้วยรหัสตัวแปร)</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink">
              PATCH
              /api/v1/stores/&#123;storeId&#125;/products/&#123;productId&#125;/variants/&#123;variantId&#125;
            </pre>
          </div>
          <div>
            <p className="font-medium text-ink">Endpoint (ระบุด้วย SKU)</p>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink">
              PATCH /api/v1/stores/&#123;storeId&#125;/variants/by-sku/&#123;sku&#125;
            </pre>
          </div>
          <p className="text-muted">
            แก้เฉพาะสต็อกและราคาของรายการที่ขายได้ — ไม่แก้ชื่อสินค้าหรือหมวดหมู่ ราคาเป็นราคาเต็ม
            (บาท) เหมือนตอนสร้างสินค้า
          </p>
          <div>
            <p className="mb-2 font-medium text-ink">
              Request Body (ต้องมีอย่างน้อย stock หรือ price)
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-muted">
                    <th className="px-4 py-2 font-medium">ฟิลด์</th>
                    <th className="px-4 py-2 font-medium">ประเภท</th>
                    <th className="px-4 py-2 font-medium">คำอธิบาย</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  <tr className="border-b border-border/60">
                    <td className="px-4 py-2 font-mono text-ink">stock</td>
                    <td className="px-4 py-2">integer</td>
                    <td className="px-4 py-2">จำนวนสต็อก (≥ 0)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-ink">price</td>
                    <td className="px-4 py-2">number</td>
                    <td className="px-4 py-2">ราคาเต็มเป็นบาท (≥ 0)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <p className="mb-2 font-medium text-ink">ตัวอย่าง cURL (by id)</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink whitespace-pre-wrap">
              {variantByIdCurl}
            </pre>
          </div>
          <div>
            <p className="mb-2 font-medium text-ink">ตัวอย่าง cURL (by SKU)</p>
            <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink whitespace-pre-wrap">
              {variantBySkuCurl}
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
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2">400</td>
                  <td className="px-4 py-2 font-mono text-ink">PET_TYPE_NOT_FOUND</td>
                  <td className="px-4 py-2">
                    ไม่พบชื่อประเภทสัตว์เลี้ยงที่ระบุ หรือยังไม่ได้รับการอนุมัติ
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2">400</td>
                  <td className="px-4 py-2 font-mono text-ink">BRAND_NOT_FOUND</td>
                  <td className="px-4 py-2">
                    ไม่พบชื่อแบรนด์ที่ระบุ หรือแบรนด์ยังไม่ได้รับการอนุมัติ
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2">400</td>
                  <td className="px-4 py-2 font-mono text-ink">SKU_EXISTS</td>
                  <td className="px-4 py-2">SKU ซ้ำกับที่มีอยู่แล้วในระบบ</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2">404</td>
                  <td className="px-4 py-2 font-mono text-ink">PRODUCT_NOT_FOUND</td>
                  <td className="px-4 py-2">ไม่พบสินค้า หรือสินค้าไม่ได้อยู่ในร้านนี้</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2">404</td>
                  <td className="px-4 py-2 font-mono text-ink">VARIANT_NOT_FOUND</td>
                  <td className="px-4 py-2">
                    ไม่พบตัวแปร หรือตัวแปรไม่ได้อยู่ในร้าน/สินค้าที่ระบุ
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2">404</td>
                  <td className="px-4 py-2 font-mono text-ink">WEBHOOK_NOT_FOUND</td>
                  <td className="px-4 py-2">ยังไม่ได้ตั้งค่า webhook สำหรับร้านนี้</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-4 py-2">404</td>
                  <td className="px-4 py-2 font-mono text-ink">ORDER_NOT_FOUND</td>
                  <td className="px-4 py-2">ไม่พบออเดอร์</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">400</td>
                  <td className="px-4 py-2 font-mono text-ink">INVALID_ORDER_STATUS</td>
                  <td className="px-4 py-2">สถานะออเดอร์ไม่อนุญาตให้อัปเดต tracking</td>
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
