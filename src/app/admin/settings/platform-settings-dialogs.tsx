'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isApiError } from '@/lib/api/errors';
import type { AdFormValues, BannerFormValues, SponsorFormValues } from '@/lib/validations';
import type { PlatformAd, PlatformBanner, PlatformSponsor } from '@/types';
import { ActiveToggleField } from './platform-settings-primitives';

function mutationErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

type BannerDialogProps = {
  open: boolean;
  editing: PlatformBanner | null;
  form: UseFormReturn<BannerFormValues>;
  pending: boolean;
  submitError: unknown;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BannerFormValues) => Promise<void>;
};

export function BannerDialog({
  open,
  editing,
  form,
  pending,
  submitError,
  onOpenChange,
  onSubmit,
}: BannerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'แก้ไขแบนเนอร์' : 'เพิ่มแบนเนอร์'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="banner-title" required>
              ชื่อแบนเนอร์
            </Label>
            <Input
              id="banner-title"
              placeholder="ชื่อแบนเนอร์"
              autoComplete="off"
              disabled={pending}
              aria-invalid={!!form.formState.errors.title}
              aria-describedby={form.formState.errors.title ? 'banner-title-error' : undefined}
              {...form.register('title')}
              className="mt-1.5"
            />
            {form.formState.errors.title ? (
              <p id="banner-title-error" className="mt-1 text-xs text-danger" role="alert">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>
          <Controller
            name="imageUrl"
            control={form.control}
            render={({ field }) => (
              <ImageUploadField
                id="banner-imageUrl"
                label="รูปภาพ (เดสก์ท็อป)"
                required
                value={field.value}
                onChange={field.onChange}
                folder="banners"
                error={form.formState.errors.imageUrl?.message}
              />
            )}
          />
          <Controller
            name="mobileImageUrl"
            control={form.control}
            render={({ field }) => (
              <ImageUploadField
                id="banner-mobileImageUrl"
                label="รูปภาพ (มือถือ)"
                value={field.value ?? ''}
                onChange={field.onChange}
                folder="banners"
                error={form.formState.errors.mobileImageUrl?.message}
              />
            )}
          />
          <div>
            <Label htmlFor="banner-linkUrl">ลิงก์ (ไม่บังคับ)</Label>
            <Input
              id="banner-linkUrl"
              type="url"
              placeholder="https://example.com"
              autoComplete="url"
              disabled={pending}
              aria-invalid={!!form.formState.errors.linkUrl}
              aria-describedby={form.formState.errors.linkUrl ? 'banner-linkUrl-error' : undefined}
              {...form.register('linkUrl')}
              className="mt-1.5"
            />
            {form.formState.errors.linkUrl ? (
              <p id="banner-linkUrl-error" className="mt-1 text-xs text-danger" role="alert">
                {form.formState.errors.linkUrl.message}
              </p>
            ) : null}
          </div>
          <ActiveToggleField
            id="banner-isActive"
            label="เปิดใช้งาน"
            disabled={pending}
            {...form.register('isActive')}
          />
          {submitError ? (
            <p role="alert" className="text-sm text-danger">
              {mutationErrorMessage(submitError, 'บันทึกแบนเนอร์ไม่สำเร็จ')}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={pending} aria-busy={pending}>
              {pending ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type SponsorDialogProps = {
  open: boolean;
  editing: PlatformSponsor | null;
  form: UseFormReturn<SponsorFormValues>;
  pending: boolean;
  submitError: unknown;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SponsorFormValues) => Promise<void>;
};

export function SponsorDialog({
  open,
  editing,
  form,
  pending,
  submitError,
  onOpenChange,
  onSubmit,
}: SponsorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'แก้ไขสปอนเซอร์' : 'เพิ่มสปอนเซอร์'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="sponsor-name" required>
              ชื่อสปอนเซอร์
            </Label>
            <Input
              id="sponsor-name"
              placeholder="ชื่อสปอนเซอร์"
              autoComplete="off"
              disabled={pending}
              aria-invalid={!!form.formState.errors.name}
              aria-describedby={form.formState.errors.name ? 'sponsor-name-error' : undefined}
              {...form.register('name')}
              className="mt-1.5"
            />
            {form.formState.errors.name ? (
              <p id="sponsor-name-error" className="mt-1 text-xs text-danger" role="alert">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <Controller
            name="imageUrl"
            control={form.control}
            render={({ field }) => (
              <ImageUploadField
                id="sponsor-imageUrl"
                label="รูปภาพ"
                required
                value={field.value}
                onChange={field.onChange}
                folder="sponsors"
                error={form.formState.errors.imageUrl?.message}
              />
            )}
          />
          <div>
            <Label htmlFor="sponsor-linkUrl">ลิงก์ (ไม่บังคับ)</Label>
            <Input
              id="sponsor-linkUrl"
              type="url"
              placeholder="https://example.com"
              autoComplete="url"
              disabled={pending}
              aria-invalid={!!form.formState.errors.linkUrl}
              aria-describedby={form.formState.errors.linkUrl ? 'sponsor-linkUrl-error' : undefined}
              {...form.register('linkUrl')}
              className="mt-1.5"
            />
            {form.formState.errors.linkUrl ? (
              <p id="sponsor-linkUrl-error" className="mt-1 text-xs text-danger" role="alert">
                {form.formState.errors.linkUrl.message}
              </p>
            ) : null}
          </div>
          <ActiveToggleField
            id="sponsor-isActive"
            label="เปิดใช้งาน"
            disabled={pending}
            {...form.register('isActive')}
          />
          {submitError ? (
            <p role="alert" className="text-sm text-danger">
              {mutationErrorMessage(submitError, 'บันทึกสปอนเซอร์ไม่สำเร็จ')}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={pending} aria-busy={pending}>
              {pending ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type AdDialogProps = {
  open: boolean;
  editing: PlatformAd | null;
  form: UseFormReturn<AdFormValues>;
  pending: boolean;
  submitError: unknown;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AdFormValues) => Promise<void>;
};

export function AdDialog({
  open,
  editing,
  form,
  pending,
  submitError,
  onOpenChange,
  onSubmit,
}: AdDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'แก้ไขโฆษณา' : 'เพิ่มโฆษณา'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="ad-title" required>
              ชื่อโฆษณา
            </Label>
            <Input
              id="ad-title"
              placeholder="ชื่อโฆษณา"
              autoComplete="off"
              disabled={pending}
              aria-invalid={!!form.formState.errors.title}
              aria-describedby={form.formState.errors.title ? 'ad-title-error' : undefined}
              {...form.register('title')}
              className="mt-1.5"
            />
            {form.formState.errors.title ? (
              <p id="ad-title-error" className="mt-1 text-xs text-danger" role="alert">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>
          <Controller
            name="imageUrl"
            control={form.control}
            render={({ field }) => (
              <ImageUploadField
                id="ad-imageUrl"
                label="รูปภาพ"
                required
                value={field.value}
                onChange={field.onChange}
                folder="ads"
                error={form.formState.errors.imageUrl?.message}
              />
            )}
          />
          <div>
            <Label htmlFor="ad-linkUrl">ลิงก์ (ไม่บังคับ)</Label>
            <Input
              id="ad-linkUrl"
              type="url"
              placeholder="https://example.com"
              autoComplete="url"
              disabled={pending}
              aria-invalid={!!form.formState.errors.linkUrl}
              aria-describedby={form.formState.errors.linkUrl ? 'ad-linkUrl-error' : undefined}
              {...form.register('linkUrl')}
              className="mt-1.5"
            />
            {form.formState.errors.linkUrl ? (
              <p id="ad-linkUrl-error" className="mt-1 text-xs text-danger" role="alert">
                {form.formState.errors.linkUrl.message}
              </p>
            ) : null}
          </div>
          <ActiveToggleField
            id="ad-isActive"
            label="เปิดใช้งาน"
            hint="หากเปิดใช้งาน โฆษณาอื่นที่เปิดอยู่จะถูกปิดอัตโนมัติ"
            disabled={pending}
            {...form.register('isActive')}
          />
          {submitError ? (
            <p role="alert" className="text-sm text-danger">
              {mutationErrorMessage(submitError, 'บันทึกโฆษณาไม่สำเร็จ')}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={pending} aria-busy={pending}>
              {pending ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
