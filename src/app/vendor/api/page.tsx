'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateStoreApiKey, useRevokeStoreApiKey, useStoreApiKeys } from '@/hooks/useApiKeys';
import { useIsStoreManager } from '@/hooks/useMembershipRole';
import { StoreIdField } from '@/components/vendor/store-id-field';
import type { StoreApiKey } from '@/types/api';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function maskKeyPrefix(keyPrefix: string): string {
  return `${keyPrefix}••••`;
}

export default function VendorApiPage() {
  const { isManager, isLoading: roleLoading } = useIsStoreManager();
  const { data: keys = [], isLoading: keysLoading } = useStoreApiKeys();
  const createMutation = useCreateStoreApiKey();
  const revokeMutation = useRevokeStoreApiKey();

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [secret, setSecret] = useState<string | null>(null);
  const [secretOpen, setSecretOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeKeys = keys.filter((key) => !key.revokedAt);
  const revokedKeys = keys.filter((key) => key.revokedAt);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      const result = await createMutation.mutateAsync(trimmed);
      setCreateOpen(false);
      setName('');
      setSecret(result.secret);
      setCopied(false);
      setSecretOpen(true);
    } catch {
      // surfaced via mutation state
    }
  }

  async function handleCopySecret() {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    setCopied(true);
  }

  if (roleLoading) {
    return <p className="text-muted">กำลังโหลด...</p>;
  }

  if (!isManager) {
    return (
      <div>
        <PageHeader title="API Keys" description="จัดการ API Key สำหรับเชื่อมต่อระบบภายนอก" />
        <Card>
          <CardBody>
            <p className="text-sm text-muted">
              เฉพาะเจ้าของร้านหรือผู้จัดการเท่านั้นที่จัดการ API Key ได้
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="API Keys"
          description="สร้างและจัดการ API Key สำหรับเชื่อมต่อระบบภายนอก"
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/vendor/api/docs">เอกสาร API</Link>
          </Button>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            สร้าง API Key
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">Store ID</h2>
        </CardHeader>
        <CardBody>
          <StoreIdField description="ใช้ Store ID นี้ใน URL ของ API เช่น /api/v1/stores/{storeId}/products — เป็นรหัสของร้านที่กำลังใช้งานอยู่ และ API Key ในหน้านี้ผูกกับร้านนี้" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display font-medium text-ink">
            API Keys ที่ใช้งาน ({activeKeys.length})
          </h2>
        </CardHeader>
        <CardBody>
          {keysLoading ? (
            <p className="text-sm text-muted">กำลังโหลด...</p>
          ) : activeKeys.length === 0 ? (
            <p className="text-sm text-muted">
              ยังไม่มี API Key — กดปุ่ม &quot;สร้าง API Key&quot; เพื่อเริ่มต้น
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="pb-3 pr-4 font-medium">ชื่อ</th>
                    <th className="pb-3 pr-4 font-medium">Key</th>
                    <th className="pb-3 pr-4 font-medium">สร้างเมื่อ</th>
                    <th className="pb-3 pr-4 font-medium">ใช้งานล่าสุด</th>
                    <th className="pb-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {activeKeys.map((key) => (
                    <tr key={key.id} className="border-b border-border/60">
                      <td className="py-3 pr-4 font-medium text-ink">{key.name}</td>
                      <td className="py-3 pr-4 font-mono text-muted">
                        {maskKeyPrefix(key.keyPrefix)}
                      </td>
                      <td className="py-3 pr-4 text-muted">{formatDate(key.createdAt)}</td>
                      <td className="py-3 pr-4 text-muted">
                        {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'ยังไม่เคยใช้'}
                      </td>
                      <td className="py-3 text-right">
                        <ConfirmDeleteButton
                          confirmLabel={key.name}
                          title="ยกเลิก API Key"
                          confirmButtonLabel="ยกเลิก"
                          description="API Key ที่ยกเลิกแล้วจะใช้งานไม่ได้อีก"
                          disabled={revokeMutation.isPending}
                          isDeleting={revokeMutation.isPending}
                          onConfirm={async () => {
                            await revokeMutation.mutateAsync(key.id);
                          }}
                        >
                          ยกเลิก
                        </ConfirmDeleteButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {revokedKeys.length > 0 ? (
        <Card>
          <CardHeader>
            <h2 className="font-display font-medium text-ink">
              API Keys ที่ยกเลิกแล้ว ({revokedKeys.length})
            </h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {revokedKeys.map((key) => (
              <div
                key={key.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 opacity-70"
              >
                <div>
                  <p className="font-medium text-ink">{key.name}</p>
                  <p className="font-mono text-sm text-muted">{maskKeyPrefix(key.keyPrefix)}</p>
                </div>
                <Badge className="border border-border">ยกเลิกแล้ว</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>สร้าง API Key</DialogTitle>
            <DialogDescription>
              ตั้งชื่อเพื่อระบุการใช้งาน เช่น &quot;ระบบสต็อก&quot;
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="api-key-name" required>
                ชื่อ API Key
              </Label>
              <Input
                id="api-key-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ระบบสต็อก"
                className="mt-1.5"
                autoFocus
                required
              />
            </div>
            {createMutation.isError ? (
              <p className="text-sm text-danger" role="alert">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : 'สร้าง API Key ไม่สำเร็จ'}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={createMutation.isPending || !name.trim()}>
                {createMutation.isPending ? 'กำลังสร้าง...' : 'สร้าง'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={secretOpen}
        onOpenChange={(open) => {
          setSecretOpen(open);
          if (!open) setSecret(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>คัดลอก API Key ของคุณ</DialogTitle>
            <DialogDescription className="text-amber-700">
              คัดลอกตอนนี้ จะไม่แสดงอีก
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm break-all">
            {secret}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCopySecret}>
              {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
            </Button>
            <Button type="button" onClick={() => setSecretOpen(false)}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
