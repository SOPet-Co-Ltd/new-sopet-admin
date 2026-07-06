'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiXMark } from 'react-icons/hi2';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useStoreReactivationRequests,
  useSubmitStoreReactivationRequest,
} from '@/hooks/useStoreReactivationRequests';
import { useImageUpload } from '@/hooks/useImageUpload';
import { labelStoreReactivationRequestStatus } from '@/lib/i18n/th';
import {
  storeReactivationRequestSchema,
  type StoreReactivationRequestFormValues,
} from '@/lib/validations';

export function StoreReactivationSection({
  storeId,
  storeName,
}: {
  storeId: string;
  storeName: string;
}) {
  const [open, setOpen] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useImageUpload('stores');
  const { data: requests = [], isLoading, error } = useStoreReactivationRequests(storeId);
  const submitMutation = useSubmitStoreReactivationRequest();

  const hasPending = requests.some((req) => req.status === 'pending');

  const form = useForm<StoreReactivationRequestFormValues>({
    resolver: zodResolver(storeReactivationRequestSchema),
    defaultValues: { title: '', content: '' },
  });

  async function handleAddMedia(file: File) {
    setMediaError(null);
    try {
      const uploaded = await upload(file);
      setMediaUrls((prev) => [...prev, uploaded.url]);
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ');
    }
  }

  function removeMedia(url: string) {
    setMediaUrls((prev) => prev.filter((item) => item !== url));
  }

  async function onSubmit(values: StoreReactivationRequestFormValues) {
    try {
      await submitMutation.mutateAsync({
        storeId,
        title: values.title,
        content: values.content,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      });
      form.reset();
      setMediaUrls([]);
      setOpen(false);
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <div className="space-y-6">
      {!open ? (
        <Button type="button" onClick={() => setOpen(true)} disabled={hasPending}>
          {hasPending ? 'มีคำขอที่รออนุมัติอยู่แล้ว' : 'ส่งคำขอเปิดใช้งานร้าน'}
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="font-display font-medium text-ink">ส่งคำขอเปิดใช้งาน — {storeName}</h2>
            <p className="mt-1 text-sm text-muted">
              อธิบายเหตุผลและแนบหลักฐานประกอบ (ถ้ามี) เพื่อให้ทีมงานพิจารณา
            </p>
          </CardHeader>
          <CardBody>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="reactivation-title" required>
                  หัวข้อ
                </Label>
                <Input
                  id="reactivation-title"
                  {...form.register('title')}
                  className="mt-1.5"
                  aria-invalid={!!form.formState.errors.title}
                />
                {form.formState.errors.title ? (
                  <p className="mt-1 text-xs text-danger">{form.formState.errors.title.message}</p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="reactivation-content" required>
                  รายละเอียด
                </Label>
                <Textarea
                  id="reactivation-content"
                  rows={5}
                  {...form.register('content')}
                  className="mt-1.5"
                  aria-invalid={!!form.formState.errors.content}
                />
                {form.formState.errors.content ? (
                  <p className="mt-1 text-xs text-danger">
                    {form.formState.errors.content.message}
                  </p>
                ) : null}
              </div>
              <div>
                <Label>ไฟล์แนบ (ไม่บังคับ)</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mediaUrls.map((url) => (
                    <div key={url} className="relative">
                      <Image
                        src={url}
                        alt=""
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-lg border border-border object-cover"
                      />
                      <button
                        type="button"
                        className="absolute -right-1 -top-1 rounded-full bg-danger px-1.5 text-xs text-white"
                        onClick={() => removeMedia(url)}
                        aria-label="ลบรูป"
                      >
                        <HiXMark className="size-3" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? 'กำลังอัปโหลด...' : 'เพิ่มรูป'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleAddMedia(file);
                      e.target.value = '';
                    }}
                  />
                </div>
                {mediaError ? <p className="mt-1 text-xs text-danger">{mediaError}</p> : null}
              </div>
              {submitMutation.error ? (
                <p className="text-sm text-danger">
                  {submitMutation.error instanceof Error
                    ? submitMutation.error.message
                    : 'ส่งคำขอไม่สำเร็จ'}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  aria-busy={submitMutation.isPending}
                >
                  {submitMutation.isPending ? 'กำลังส่ง...' : 'ส่งคำขอ'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setMediaUrls([]);
                    setOpen(false);
                  }}
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">
            ประวัติคำขอเปิดใช้งาน ({requests.length})
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted">กำลังโหลด...</p>
          ) : error ? (
            <p className="text-sm text-danger">
              {error instanceof Error ? error.message : 'โหลดไม่สำเร็จ'}
            </p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted">ยังไม่มีคำขอ</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="rounded-lg border border-border px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-ink">{req.title}</p>
                  <Badge>{labelStoreReactivationRequestStatus(req.status)}</Badge>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{req.content}</p>
                {req.images.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {req.images.map((image) => (
                      <a
                        key={image.id}
                        href={image.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image
                          src={image.imageUrl}
                          alt=""
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded border border-border object-cover"
                        />
                      </a>
                    ))}
                  </div>
                ) : null}
                {req.reviewNote ? (
                  <p className="mt-2 text-sm text-danger">คำตอบจากผู้ดูแล: {req.reviewNote}</p>
                ) : null}
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
