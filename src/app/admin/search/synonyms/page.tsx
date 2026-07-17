'use client';

import { useState } from 'react';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCreateSearchSynonym,
  useDeleteSearchSynonym,
  useSearchSynonyms,
  useUpdateSearchSynonym,
} from '@/hooks/useSearchAdmin';
import { cn } from '@/lib/utils';

function SynonymListSkeleton() {
  return (
    <ul className="divide-y divide-border" aria-busy="true" aria-label="กำลังโหลดคำพ้องความหมาย">
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-36 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
            <div className="h-3 w-56 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
            <div className="h-8 w-16 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
          </div>
        </li>
      ))}
      <span className="sr-only">กำลังโหลดคำพ้องความหมาย...</span>
    </ul>
  );
}

function SynonymsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div
        className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground"
        aria-hidden="true"
      >
        <HiMagnifyingGlass className="size-6" />
      </div>
      <p className="mt-4 font-medium text-ink">ยังไม่มีคำพ้องความหมาย</p>
      <p className="mt-1.5 max-w-sm text-pretty text-sm text-muted-foreground">
        เพิ่มคำค้นและคำขยายด้านบน เพื่อให้ Smart Search
        จับคู่คำที่ลูกค้าพิมพ์กับชื่อสินค้าหรือแบรนด์ที่ถูกต้อง
      </p>
    </div>
  );
}

export default function AdminSearchSynonymsPage() {
  const { data: synonyms = [], isLoading, error } = useSearchSynonyms();
  const createMutation = useCreateSearchSynonym();
  const updateMutation = useUpdateSearchSynonym();
  const deleteMutation = useDeleteSearchSynonym();

  const [termsInput, setTermsInput] = useState('');
  const [expansionInput, setExpansionInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const activeCount = synonyms.filter((synonym) => synonym.isActive).length;

  const handleCreate = async () => {
    setFormError(null);
    setFormSuccess(null);
    const terms = termsInput
      .split(',')
      .map((term) => term.trim())
      .filter(Boolean);

    if (terms.length === 0 || !expansionInput.trim()) {
      setFormError('กรุณากรอกคำค้นและคำขยาย');
      return;
    }

    try {
      await createMutation.mutateAsync({
        terms,
        expansion: expansionInput.trim(),
        isActive: true,
      });
      setTermsInput('');
      setExpansionInput('');
      setFormSuccess('เพิ่มคำพ้องความหมายแล้ว');
    } catch (mutationError) {
      setFormError(mutationError instanceof Error ? mutationError.message : 'บันทึกไม่สำเร็จ');
    }
  };

  return (
    <div className="min-w-0 space-y-10">
      <PageHeader
        title="คำพ้องความหมายการค้นหา"
        description="จับคู่คำที่ลูกค้าพิมพ์กับคำขยายที่ใช้ค้นหา — ช่วยลดคำค้นที่ไม่พบผลลัพธ์"
      />

      <section aria-labelledby="synonym-create-heading" className="min-w-0">
        <Card>
          <CardHeader>
            <h2 id="synonym-create-heading" className="font-medium text-ink">
              เพิ่มคำพ้องความหมาย
            </h2>
            <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
              คั่นคำค้นหลายคำด้วยเครื่องหมายจุลภาค — คำขยายควรตรงกับชื่อสินค้าหรือแบรนด์ในแคตตาล็อก
            </p>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="synonym-terms">คำค้น (คั่นด้วยจุลภาค)</Label>
                <Input
                  id="synonym-terms"
                  value={termsInput}
                  onChange={(event) => {
                    setFormError(null);
                    setFormSuccess(null);
                    setTermsInput(event.target.value);
                  }}
                  placeholder="royal, royal canin"
                  aria-invalid={formError ? true : undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="synonym-expansion">คำขยาย</Label>
                <Input
                  id="synonym-expansion"
                  value={expansionInput}
                  onChange={(event) => {
                    setFormError(null);
                    setFormSuccess(null);
                    setExpansionInput(event.target.value);
                  }}
                  placeholder="Royal Canin"
                  aria-invalid={formError ? true : undefined}
                />
              </div>
            </div>

            {formError ? (
              <p role="alert" className="text-sm text-danger">
                {formError}
              </p>
            ) : null}
            {formSuccess ? (
              <p role="status" className="text-sm text-success">
                {formSuccess}
              </p>
            ) : null}

            <div>
              <Button
                type="button"
                onClick={() => void handleCreate()}
                disabled={createMutation.isPending}
                aria-busy={createMutation.isPending}
              >
                {createMutation.isPending ? 'กำลังบันทึก...' : 'เพิ่มคำพ้องความหมาย'}
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>

      <section aria-labelledby="synonym-list-heading" className="min-w-0">
        <Card>
          <CardHeader className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 id="synonym-list-heading" className="font-medium text-ink">
                รายการคำพ้องความหมาย
              </h2>
              <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
                {isLoading
                  ? 'กำลังโหลดรายการ...'
                  : synonyms.length === 0
                    ? 'ยังไม่มีรายการ'
                    : `${synonyms.length.toLocaleString('th-TH')} รายการ · เปิดใช้งาน ${activeCount.toLocaleString('th-TH')}`}
              </p>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {error ? (
              <p
                role="alert"
                className="mx-5 my-4 rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger"
              >
                {error instanceof Error ? error.message : 'โหลดรายการไม่สำเร็จ'}
              </p>
            ) : null}

            {isLoading ? <SynonymListSkeleton /> : null}

            {!isLoading && !error && synonyms.length === 0 ? <SynonymsEmptyState /> : null}

            {!isLoading && !error && synonyms.length > 0 ? (
              <ul className="divide-y divide-border">
                {synonyms.map((synonym) => {
                  const isToggling = togglingId === synonym.id && updateMutation.isPending;

                  return (
                    <li
                      key={synonym.id}
                      className={cn(
                        'flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition-colors',
                        !synonym.isActive && 'bg-surface/60',
                      )}
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <p className="min-w-0 truncate font-medium text-ink">
                            {synonym.expansion}
                          </p>
                          <Badge status={synonym.isActive ? 'published' : 'draft'}>
                            {synonym.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                          </Badge>
                        </div>
                        <p className="min-w-0 text-sm text-pretty text-muted-foreground">
                          <span className="text-muted-foreground">คำค้น: </span>
                          {synonym.terms.join(', ')}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={updateMutation.isPending || deleteMutation.isPending}
                          aria-busy={isToggling}
                          onClick={() => {
                            setTogglingId(synonym.id);
                            updateMutation.mutate(
                              {
                                id: synonym.id,
                                input: { isActive: !synonym.isActive },
                              },
                              {
                                onSettled: () => setTogglingId(null),
                              },
                            );
                          }}
                        >
                          {isToggling
                            ? 'กำลังอัปเดต...'
                            : synonym.isActive
                              ? 'ปิดใช้งาน'
                              : 'เปิดใช้งาน'}
                        </Button>
                        <ConfirmDeleteButton
                          confirmLabel={synonym.expansion}
                          title="ลบคำพ้องความหมาย"
                          variant="destructive"
                          disabled={deleteMutation.isPending || updateMutation.isPending}
                          isDeleting={deleteMutation.isPending}
                          onConfirm={async () => {
                            await deleteMutation.mutateAsync(synonym.id);
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
