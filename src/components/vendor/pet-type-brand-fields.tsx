'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useApprovedPetTypes,
  useApprovedBrands,
  useCreatePetType,
  useCreateBrand,
} from '@/hooks/useTaxonomy';
import { labelTaxonomyStatus } from '@/lib/i18n/th';
import { proposeTaxonomySchema, type ProposeTaxonomyFormValues } from '@/lib/validations';

interface PetTypeFieldProps {
  value?: string;
  onChange: (petTypeId: string) => void;
  error?: string;
}

export function PetTypeField({ value, onChange, error }: PetTypeFieldProps) {
  const { data: petTypes = [], isLoading, error: loadError } = useApprovedPetTypes();
  const createMutation = useCreatePetType();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const form = useForm<ProposeTaxonomyFormValues>({
    resolver: zodResolver(proposeTaxonomySchema),
    defaultValues: { name: '' },
  });

  async function onPropose(values: ProposeTaxonomyFormValues) {
    try {
      const created = await createMutation.mutateAsync({ name: values.name });
      if (created.status === 'approved') {
        onChange(created.id);
      }
      setNotice(
        created.status === 'approved'
          ? `เพิ่มประเภทสัตว์เลี้ยง "${created.name}" แล้ว`
          : `ส่งคำขอ "${created.name}" แล้ว (${labelTaxonomyStatus(created.status)})`,
      );
      setDialogOpen(false);
      form.reset();
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="pet-type">ประเภทสัตว์เลี้ยง</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs"
          onClick={() => setDialogOpen(true)}
        >
          เสนอประเภทสัตว์เลี้ยงใหม่
        </Button>
      </div>
      <Select value={value ?? ''} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger
          id="pet-type"
          className="mt-1.5"
          aria-invalid={!!error}
          aria-describedby={error ? 'pet-type-error' : undefined}
        >
          <SelectValue placeholder={isLoading ? 'กำลังโหลด...' : 'เลือกประเภทสัตว์เลี้ยง'} />
        </SelectTrigger>
        <SelectContent>
          {petTypes.map((petType) => (
            <SelectItem key={petType.id} value={petType.id}>
              {petType.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {notice ? <p className="mt-1 text-xs text-muted">{notice}</p> : null}
      {loadError ? (
        <p className="mt-1 text-xs text-muted">
          ยังโหลดประเภทสัตว์เลี้ยงไม่ได้ — ลองใหม่เมื่อ API พร้อม
        </p>
      ) : null}
      {error ? (
        <p id="pet-type-error" className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เสนอประเภทสัตว์เลี้ยงใหม่</DialogTitle>
            <DialogDescription>
              ประเภทสัตว์เลี้ยงจะถูกส่งให้ผู้ดูแลอนุมัติก่อนแสดงในรายการทั้งหมด
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onPropose)} className="space-y-4">
            <div>
              <Label htmlFor="propose-pet-type" required>
                ชื่อประเภทสัตว์เลี้ยง
              </Label>
              <Input
                id="propose-pet-type"
                placeholder="เช่น สุนัข, แมว"
                aria-invalid={!!form.formState.errors.name}
                aria-describedby={form.formState.errors.name ? 'propose-pet-type-error' : undefined}
                {...form.register('name')}
                className="mt-1"
              />
              {form.formState.errors.name ? (
                <p id="propose-pet-type-error" className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            {createMutation.error ? (
              <p className="text-sm text-danger" role="alert">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : 'ส่งคำขอไม่สำเร็จ'}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                aria-busy={createMutation.isPending}
              >
                {createMutation.isPending ? 'กำลังส่ง...' : 'ส่งคำขอ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface BrandFieldProps {
  value?: string;
  onChange: (brandId: string) => void;
  error?: string;
}

export function BrandField({ value, onChange, error }: BrandFieldProps) {
  const { data: brands = [], isLoading, error: loadError } = useApprovedBrands();
  const createMutation = useCreateBrand();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const form = useForm<ProposeTaxonomyFormValues>({
    resolver: zodResolver(proposeTaxonomySchema),
    defaultValues: { name: '' },
  });

  async function onPropose(values: ProposeTaxonomyFormValues) {
    try {
      const created = await createMutation.mutateAsync(values.name);
      if (created.status === 'approved') {
        onChange(created.id);
      }
      setNotice(
        created.status === 'approved'
          ? `เพิ่มแบรนด์ "${created.name}" แล้ว`
          : `ส่งคำขอ "${created.name}" แล้ว (${labelTaxonomyStatus(created.status)})`,
      );
      setDialogOpen(false);
      form.reset();
    } catch {
      // surfaced via mutation state
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="brand">แบรนด์</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-xs"
          onClick={() => setDialogOpen(true)}
        >
          เสนอแบรนด์ใหม่
        </Button>
      </div>
      <Select value={value ?? ''} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger
          id="brand"
          className="mt-1.5"
          aria-invalid={!!error}
          aria-describedby={error ? 'brand-error' : undefined}
        >
          <SelectValue placeholder={isLoading ? 'กำลังโหลด...' : 'เลือกแบรนด์'} />
        </SelectTrigger>
        <SelectContent>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {notice ? <p className="mt-1 text-xs text-muted">{notice}</p> : null}
      {loadError ? (
        <p className="mt-1 text-xs text-muted">ยังโหลดแบรนด์ไม่ได้ — ลองใหม่เมื่อ API พร้อม</p>
      ) : null}
      {error ? (
        <p id="brand-error" className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เสนอแบรนด์ใหม่</DialogTitle>
            <DialogDescription>
              แบรนด์จะถูกส่งให้ผู้ดูแลอนุมัติก่อนแสดงในรายการทั้งหมด
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onPropose)} className="space-y-4">
            <div>
              <Label htmlFor="propose-brand" required>
                ชื่อแบรนด์
              </Label>
              <Input
                id="propose-brand"
                placeholder="ชื่อแบรนด์"
                aria-invalid={!!form.formState.errors.name}
                aria-describedby={form.formState.errors.name ? 'propose-brand-error' : undefined}
                {...form.register('name')}
                className="mt-1"
              />
              {form.formState.errors.name ? (
                <p id="propose-brand-error" className="mt-1 text-xs text-danger" role="alert">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            {createMutation.error ? (
              <p className="text-sm text-danger" role="alert">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : 'ส่งคำขอไม่สำเร็จ'}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                aria-busy={createMutation.isPending}
              >
                {createMutation.isPending ? 'กำลังส่ง...' : 'ส่งคำขอ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
