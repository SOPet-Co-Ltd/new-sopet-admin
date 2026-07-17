'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SearchRankingWeights } from '@/lib/api/search';
import type { UpdateSearchRankingWeightsInput } from '@/lib/graphql/generated/graphql';
import { cn } from '@/lib/utils';

type SearchRankingWeightFormProps = {
  initialWeights?: SearchRankingWeights;
  loading?: boolean;
  saving?: boolean;
  onSubmit: (input: UpdateSearchRankingWeightsInput) => Promise<void>;
};

type WeightField = {
  key: keyof UpdateSearchRankingWeightsInput;
  label: string;
  helper: string;
  step?: string;
  min?: number;
  max?: number;
};

const RANKING_FIELDS: WeightField[] = [
  {
    key: 'text',
    label: 'ความเกี่ยวข้องของข้อความ',
    helper: 'น้ำหนักการจับคู่ข้อความ (FTS rank)',
  },
  {
    key: 'prefixBoost',
    label: 'บูสต์คำขึ้นต้น',
    helper: 'เพิ่มคะแนนเมื่อชื่อสินค้าขึ้นต้นด้วยคำค้น',
  },
  {
    key: 'soldCount',
    label: 'ยอดขายสะสม',
    helper: 'น้ำหนักยอดขายสะสมของสินค้า',
  },
  {
    key: 'averageRating',
    label: 'คะแนนรีวิวเฉลี่ย',
    helper: 'น้ำหนักคะแนนรีวิวเฉลี่ย',
  },
  {
    key: 'reviewCount',
    label: 'จำนวนรีวิว',
    helper: 'น้ำหนักจำนวนรีวิวที่สะสม',
  },
];

const ADVANCED_FIELDS: WeightField[] = [
  {
    key: 'personalizationCap',
    label: 'เพดานการปรับตามพฤติกรรม',
    helper: 'จำกัดการเลื่อนอันดับจากพฤติกรรมผู้ใช้ (0–0.20)',
    step: '0.01',
    min: 0,
    max: 0.2,
  },
  {
    key: 'trigramFallbackThreshold',
    label: 'เกณฑ์เปิดใช้ trigram',
    helper: 'จำนวนผลลัพธ์ต่ำกว่านี้จะเปิด fallback แบบ trigram',
  },
  {
    key: 'trigramMinSimilarity',
    label: 'ความคล้ายขั้นต่ำของ trigram',
    helper: 'ค่า similarity ขั้นต่ำสำหรับการจับคู่ใกล้เคียง',
    step: '0.01',
  },
  {
    key: 'rrfK',
    label: 'ค่าคงที่ RRF (k)',
    helper: 'พารามิเตอร์ k ของ Reciprocal Rank Fusion',
  },
];

type FieldErrors = Partial<Record<keyof UpdateSearchRankingWeightsInput, string>>;

function toFormValues(weights: SearchRankingWeights): UpdateSearchRankingWeightsInput {
  return {
    text: weights.text,
    prefixBoost: weights.prefixBoost,
    soldCount: weights.soldCount,
    averageRating: weights.averageRating,
    reviewCount: weights.reviewCount,
    personalizationCap: weights.personalizationCap,
    trigramFallbackThreshold: weights.trigramFallbackThreshold,
    trigramMinSimilarity: weights.trigramMinSimilarity,
    rrfK: weights.rrfK,
  };
}

function validateValues(values: UpdateSearchRankingWeightsInput): FieldErrors {
  const errors: FieldErrors = {};
  const numericKeys: (keyof UpdateSearchRankingWeightsInput)[] = [
    'text',
    'prefixBoost',
    'soldCount',
    'averageRating',
    'reviewCount',
    'personalizationCap',
    'trigramFallbackThreshold',
    'trigramMinSimilarity',
    'rrfK',
  ];

  for (const key of numericKeys) {
    const value = values[key];
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value !== 'number' || Number.isNaN(value)) {
      errors[key] = 'กรุณากรอกตัวเลขที่ถูกต้อง';
      continue;
    }

    if (key === 'personalizationCap') {
      if (value < 0 || value > 0.2) {
        errors[key] = 'ค่าต้องอยู่ระหว่าง 0 ถึง 0.20';
      }
      continue;
    }

    if (value < 0) {
      errors[key] = 'ค่าต้องไม่ติดลบ';
    }
  }

  return errors;
}

function WeightFieldInput({
  field,
  value,
  error,
  disabled,
  onChange,
}: {
  field: WeightField;
  value: number | undefined;
  error?: string;
  disabled: boolean;
  onChange: (rawValue: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.key}>{field.label}</Label>
      <Input
        id={field.key}
        type="number"
        min={field.min ?? 0}
        max={field.max}
        step={field.step ?? '1'}
        value={value ?? ''}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${field.key}-help${error ? ` ${field.key}-error` : ''}`}
        onChange={(event) => onChange(event.target.value)}
      />
      <p id={`${field.key}-help`} className="text-sm text-pretty text-muted-foreground">
        {field.helper}
      </p>
      {error ? (
        <p id={`${field.key}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SearchRankingWeightFormSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="กำลังโหลดน้ำหนักการจัดอันดับ">
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-28 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
            <div className="h-10 w-full animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
            <div className="h-3 w-48 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-6">
        <div className="mb-4 h-4 w-32 animate-pulse rounded bg-surface motion-reduce:animate-none" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 w-36 max-w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
              <div className="h-10 w-full animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">กำลังโหลดน้ำหนักการจัดอันดับ...</span>
    </div>
  );
}

export function SearchRankingWeightForm({
  initialWeights,
  loading = false,
  saving = false,
  onSubmit,
}: SearchRankingWeightFormProps) {
  const [values, setValues] = useState<UpdateSearchRankingWeightsInput>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [appliedWeights, setAppliedWeights] = useState<SearchRankingWeights | undefined>(undefined);

  if (initialWeights && initialWeights !== appliedWeights) {
    setAppliedWeights(initialWeights);
    setValues(toFormValues(initialWeights));
  }

  const handleChange = (key: keyof UpdateSearchRankingWeightsInput, rawValue: string) => {
    setSavedMessage(null);
    setSubmitError(null);
    setValues((current) => ({
      ...current,
      [key]: rawValue === '' ? undefined : Number(rawValue),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedMessage(null);
    setSubmitError(null);

    const nextErrors = validateValues(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await onSubmit(values);
      setSavedMessage('บันทึกการตั้งค่าแล้ว');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ');
    }
  };

  const disabled = loading || saving;

  return (
    <form className="space-y-8" noValidate onSubmit={handleSubmit}>
      <fieldset className="space-y-4" disabled={disabled}>
        <legend className="sr-only">น้ำหนักการจัดอันดับหลัก</legend>
        <div className="grid gap-5 md:grid-cols-2">
          {RANKING_FIELDS.map((field) => (
            <WeightFieldInput
              key={field.key}
              field={field}
              value={values[field.key] ?? undefined}
              error={errors[field.key]}
              disabled={disabled}
              onChange={(rawValue) => handleChange(field.key, rawValue)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-border pt-6" disabled={disabled}>
        <legend className="mb-1 text-sm font-medium text-ink">การตั้งค่าขั้นสูง</legend>
        <p className="text-sm text-pretty text-muted-foreground">
          พารามิเตอร์ fallback และเพดานการปรับอันดับ — เปลี่ยนเมื่อเข้าใจผลกระทบต่อผลลัพธ์
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          {ADVANCED_FIELDS.map((field) => (
            <WeightFieldInput
              key={field.key}
              field={field}
              value={values[field.key] ?? undefined}
              error={errors[field.key]}
              disabled={disabled}
              onChange={(rawValue) => handleChange(field.key, rawValue)}
            />
          ))}
        </div>
      </fieldset>

      <div
        className={cn(
          'flex flex-wrap items-center gap-3 border-t border-border pt-6',
          submitError || savedMessage ? 'items-start sm:items-center' : null,
        )}
      >
        <Button type="submit" disabled={disabled} aria-busy={saving}>
          {saving ? 'กำลังบันทึก...' : 'บันทึกน้ำหนัก'}
        </Button>
        {savedMessage ? (
          <p role="status" className="text-sm text-success">
            {savedMessage}
          </p>
        ) : null}
        {submitError ? (
          <p role="alert" className="text-sm text-danger">
            {submitError}
          </p>
        ) : null}
      </div>
    </form>
  );
}
