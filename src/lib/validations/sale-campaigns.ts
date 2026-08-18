import { z } from 'zod';
import type { SaleCampaign, SaleCampaignItemInput } from '@/types';

const saleCampaignItemSchema = z
  .object({
    productId: z.string().min(1, 'กรุณาเลือกสินค้า'),
    productName: z.string().optional(),
    variantId: z.string().optional(),
    discountPercent: z
      .number()
      .min(1, 'เปอร์เซ็นต์ส่วนลดต้องอยู่ระหว่าง 1–99')
      .max(99, 'เปอร์เซ็นต์ส่วนลดต้องอยู่ระหว่าง 1–99')
      .optional(),
    compareAtPrice: z.number().min(0.01, 'ราคาเปรียบเทียบต้องสูงกว่าราคาขาย').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.discountPercent === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['discountPercent'],
        message: 'กรุณากรอกเปอร์เซ็นต์ส่วนลด',
      });
    }
  });

export const saleCampaignFormSchema = z
  .object({
    name: z.string().min(1, 'กรุณากรอกชื่อแคมเปญ'),
    description: z.string().optional(),
    startsAt: z.string().optional(),
    expiresAt: z.string().optional(),
    priority: z.number().optional(),
    isActive: z.boolean().optional(),
    items: z.array(saleCampaignItemSchema).min(1, 'กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ'),
  })
  .superRefine((data, ctx) => {
    if (data.startsAt && data.expiresAt) {
      const start = new Date(data.startsAt);
      const end = new Date(data.expiresAt);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end <= start) {
        ctx.addIssue({
          code: 'custom',
          path: ['expiresAt'],
          message: 'วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น',
        });
      }
    }
  });

export type SaleCampaignFormValues = z.infer<typeof saleCampaignFormSchema>;

export function getSaleCampaignFormDefaults(): SaleCampaignFormValues {
  return {
    name: '',
    description: '',
    startsAt: '',
    expiresAt: '',
    priority: 0,
    isActive: true,
    items: [],
  };
}

export function getSaleCampaignFormValuesFromCampaign(
  campaign: SaleCampaign,
): SaleCampaignFormValues {
  return {
    name: campaign.name,
    description: campaign.description ?? '',
    startsAt: campaign.startsAt?.slice(0, 16) ?? '',
    expiresAt: campaign.expiresAt?.slice(0, 16) ?? '',
    priority: campaign.priority,
    isActive: campaign.isActive,
    items: campaign.items.map((item) => ({
      productId: item.productId,
      productName: item.productName ?? undefined,
      variantId: item.variantId ?? undefined,
      discountPercent: item.discountPercent ?? undefined,
      compareAtPrice: item.compareAtPrice ?? undefined,
    })),
  };
}

export function buildSaleCampaignItemsInput(
  values: SaleCampaignFormValues,
): SaleCampaignItemInput[] {
  return values.items.map((item) => {
    if (item.discountPercent == null) {
      throw new Error('discountPercent is required');
    }
    return {
      productId: item.productId,
      variantId: item.variantId || undefined,
      discountPercent: item.discountPercent,
      compareAtPrice: item.compareAtPrice,
    };
  });
}
