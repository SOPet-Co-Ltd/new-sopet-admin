'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useClearLoginPageDesktopImage,
  useClearLoginPageMobileImage,
  useLoginPageImages,
  useUpdateLoginPageImages,
} from '@/hooks/usePlatformSettings';
import { loginPageImagesToFormValues } from '@/lib/api/platform';
import { isApiError } from '@/lib/api/errors';
import { loginImagesFormSchema, type LoginImagesFormValues } from '@/lib/validations';
import {
  ListRowSkeleton,
  PlatformSettingsLoadError,
  PlatformSettingsMutationError,
} from './platform-settings-primitives';

const EMPTY_FORM: LoginImagesFormValues = {
  desktopImageUrl: '',
  mobileImageUrl: '',
  altText: '',
};

const EMPTY_HELPER = 'ยังไม่ได้ตั้งค่ารูปหน้าเข้าสู่ระบบ — อัปโหลดรูปเดสก์ท็อปเพื่อเริ่มต้น';

const CLEAR_DESKTOP_TITLE = 'ล้างรูปเดสก์ท็อป?';
const CLEAR_DESKTOP_DESCRIPTION = 'การล้างรูปเดสก์ท็อปจะล้างรูปมือถือด้วย และตั้งค่าจะว่างทั้งหมด';
const CLEAR_PHRASE = 'ล้างรูป';

export function LoginImagesPanel() {
  const { data, isLoading, error: loadError, refetch } = useLoginPageImages();
  const updateMutation = useUpdateLoginPageImages();
  const clearDesktopMutation = useClearLoginPageDesktopImage();
  const clearMobileMutation = useClearLoginPageMobileImage();

  const [clearDesktopOpen, setClearDesktopOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const form = useForm<LoginImagesFormValues>({
    resolver: zodResolver(loginImagesFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isDirty },
  } = form;

  const desktopImageUrl = useWatch({ control, name: 'desktopImageUrl' });
  const mobileImageUrl = useWatch({ control, name: 'mobileImageUrl' });
  const altText = useWatch({ control, name: 'altText' });

  useEffect(() => {
    if (!data) return;
    // Sync form when server field values change — avoid depending on `data` object identity.
    // Do not clear UI feedback here (setState-in-effect); handlers clear messages on user action.
    reset(loginPageImagesToFormValues(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional field-level deps
  }, [data?.desktopImageUrl, data?.mobileImageUrl, data?.altText, reset]);

  const busy =
    updateMutation.isPending || clearDesktopMutation.isPending || clearMobileMutation.isPending;

  const isEmptyConfig = !desktopImageUrl && !mobileImageUrl && !altText;

  async function onSave(values: LoginImagesFormValues) {
    setSavedMessage(null);
    setActionError(null);
    try {
      const result = await updateMutation.mutateAsync(values);
      reset(loginPageImagesToFormValues(result));
      setSavedMessage('บันทึกการตั้งค่าแล้ว');
    } catch (err) {
      setActionError(isApiError(err) ? err.message : 'บันทึกไม่สำเร็จ');
    }
  }

  async function onClearMobile() {
    setSavedMessage(null);
    setActionError(null);
    try {
      const result = await clearMobileMutation.mutateAsync();
      reset(loginPageImagesToFormValues(result));
      setSavedMessage('บันทึกการตั้งค่าแล้ว');
    } catch (err) {
      setActionError(isApiError(err) ? err.message : 'ล้างรูปไม่สำเร็จ');
    }
  }

  async function onClearDesktopConfirm() {
    setSavedMessage(null);
    setActionError(null);
    const result = await clearDesktopMutation.mutateAsync();
    reset(loginPageImagesToFormValues(result));
    setSavedMessage('บันทึกการตั้งค่าแล้ว');
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <h2 className="font-display font-medium text-balance text-ink">รูปหน้าเข้าสู่ระบบ</h2>
        <p className="text-sm text-pretty text-muted-foreground">
          ตั้งค่ารูปเดสก์ท็อปและมือถือสำหรับหน้าเข้าสู่ระบบลูกค้า
        </p>
      </CardHeader>
      <CardBody className="space-y-6">
        {isLoading && !data ? (
          <ListRowSkeleton rows={2} label="กำลังโหลดรูปหน้าเข้าสู่ระบบ" />
        ) : loadError ? (
          <PlatformSettingsLoadError
            message="โหลดรูปหน้าเข้าสู่ระบบไม่สำเร็จ"
            detail={loadError}
            onRetry={() => void refetch()}
          />
        ) : (
          <form
            className="space-y-6"
            noValidate
            onSubmit={(event) => {
              void handleSubmit(onSave)(event);
            }}
          >
            {isEmptyConfig ? (
              <p className="text-sm text-pretty text-muted-foreground">{EMPTY_HELPER}</p>
            ) : null}

            <ImageUploadField
              label="รูปภาพ (เดสก์ท็อป)"
              value={desktopImageUrl}
              onChange={(url) => {
                setSavedMessage(null);
                setActionError(null);
                setValue('desktopImageUrl', url, { shouldDirty: true, shouldValidate: true });
              }}
              onClear={() => {
                setSavedMessage(null);
                setActionError(null);
                setClearDesktopOpen(true);
              }}
              folder="login-images"
              required
              disabled={busy}
              error={errors.desktopImageUrl?.message}
            />

            <ImageUploadField
              label="รูปภาพ (มือถือ)"
              value={mobileImageUrl}
              onChange={(url) => {
                setSavedMessage(null);
                setActionError(null);
                setValue('mobileImageUrl', url, { shouldDirty: true, shouldValidate: true });
              }}
              onClear={() => {
                void onClearMobile();
              }}
              folder="login-images"
              disabled={busy || clearMobileMutation.isPending}
              error={errors.mobileImageUrl?.message}
            />

            <div className="space-y-2">
              <Label htmlFor="login-images-alt">ข้อความแทนรูป (Alt text)</Label>
              <Input
                id="login-images-alt"
                {...register('altText', {
                  onChange: () => {
                    setSavedMessage(null);
                    setActionError(null);
                  },
                })}
                disabled={busy}
                maxLength={255}
                aria-invalid={Boolean(errors.altText)}
              />
              <p className="text-xs text-muted-foreground">
                ไม่บังคับ — ใช้สำหรับความเข้าถึงบนหน้าร้านในอนาคต
              </p>
              {errors.altText ? (
                <p role="alert" className="text-xs text-danger">
                  {errors.altText.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <Button
                type="submit"
                disabled={!isDirty || busy}
                aria-busy={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
              {savedMessage ? (
                <p role="status" className="text-sm text-success">
                  {savedMessage}
                </p>
              ) : null}
            </div>

            {actionError ? <PlatformSettingsMutationError message={actionError} /> : null}
          </form>
        )}
      </CardBody>

      <ConfirmDeleteDialog
        open={clearDesktopOpen}
        onOpenChange={setClearDesktopOpen}
        title={CLEAR_DESKTOP_TITLE}
        confirmLabel={CLEAR_PHRASE}
        confirmButtonLabel={CLEAR_PHRASE}
        dialogDescription={CLEAR_DESKTOP_DESCRIPTION}
        confirmPendingLabel="กำลังล้าง..."
        errorFallbackMessage="ล้างรูปไม่สำเร็จ"
        isDeleting={clearDesktopMutation.isPending}
        onConfirm={onClearDesktopConfirm}
      />
    </Card>
  );
}
