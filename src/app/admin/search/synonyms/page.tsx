'use client';

import { useState } from 'react';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCreateSearchSynonym,
  useDeleteSearchSynonym,
  useSearchSynonyms,
  useUpdateSearchSynonym,
} from '@/hooks/useSearchAdmin';

export default function AdminSearchSynonymsPage() {
  const { data: synonyms = [], isLoading, error } = useSearchSynonyms();
  const createMutation = useCreateSearchSynonym();
  const updateMutation = useUpdateSearchSynonym();
  const deleteMutation = useDeleteSearchSynonym();

  const [termsInput, setTermsInput] = useState('');
  const [expansionInput, setExpansionInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = async () => {
    setFormError(null);
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
    } catch (mutationError) {
      setFormError(mutationError instanceof Error ? mutationError.message : 'บันทึกไม่สำเร็จ');
    }
  };

  return (
    <div>
      <PageHeader
        title="คำพ้องความหมายการค้นหา"
        description="จัดการคำพ้องความหมายที่ใช้ขยายผลการค้นหา"
      />

      <Card className="mb-6">
        <CardBody className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="synonym-terms">คำค้น (คั่นด้วย comma)</Label>
            <Input
              id="synonym-terms"
              value={termsInput}
              onChange={(event) => setTermsInput(event.target.value)}
              placeholder="royal, royal canin"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="synonym-expansion">คำขยาย</Label>
            <Input
              id="synonym-expansion"
              value={expansionInput}
              onChange={(event) => setExpansionInput(event.target.value)}
              placeholder="Royal Canin"
            />
          </div>
          {formError ? <p className="text-sm text-danger">{formError}</p> : null}
          <Button type="button" onClick={handleCreate} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'กำลังบันทึก...' : 'เพิ่มคำพ้องความหมาย'}
          </Button>
        </CardBody>
      </Card>

      {isLoading ? <p className="text-muted">กำลังโหลด...</p> : null}
      {error ? (
        <p className="text-danger">{error instanceof Error ? error.message : 'โหลดไม่สำเร็จ'}</p>
      ) : null}

      <ul className="space-y-3">
        {synonyms.map((synonym) => (
          <li key={synonym.id}>
            <Card>
              <CardBody className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-ink">{synonym.expansion}</p>
                  <p className="text-sm text-muted">{synonym.terms.join(', ')}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: synonym.id,
                        input: { isActive: !synonym.isActive },
                      })
                    }
                  >
                    {synonym.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                  </Button>
                  <ConfirmDeleteButton
                    confirmLabel={synonym.expansion}
                    title="ลบคำพ้องความหมาย"
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                    isDeleting={deleteMutation.isPending}
                    onConfirm={() => deleteMutation.mutate(synonym.id)}
                  />
                </div>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
