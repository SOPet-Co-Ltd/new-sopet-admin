'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SearchRankingWeights } from '@/lib/api/search';
import type { UpdateSearchRankingWeightsInput } from '@/lib/graphql/generated/graphql';

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
};

const WEIGHT_FIELDS: WeightField[] = [
  {
    key: 'text',
    label: 'Text relevance',
    helper: 'น้ำหนักการจับคู่ข้อความ (FTS rank)',
  },
  {
    key: 'prefixBoost',
    label: 'Prefix boost',
    helper: 'เพิ่มคะแนนเมื่อชื่อสินค้าขึ้นต้นด้วยคำค้น',
  },
  {
    key: 'soldCount',
    label: 'Sold count',
    helper: 'น้ำหนักยอดขายสะสม',
  },
  {
    key: 'averageRating',
    label: 'Average rating',
    helper: 'น้ำหนักคะแนนรีวิวเฉลี่ย',
  },
  {
    key: 'reviewCount',
    label: 'Review count',
    helper: 'น้ำหนักจำนวนรีวิว',
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

export function SearchRankingWeightForm({
  initialWeights,
  loading = false,
  saving = false,
  onSubmit,
}: SearchRankingWeightFormProps) {
  const [values, setValues] = useState<UpdateSearchRankingWeightsInput>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [appliedWeights, setAppliedWeights] = useState<SearchRankingWeights | undefined>(undefined);

  if (initialWeights && initialWeights !== appliedWeights) {
    setAppliedWeights(initialWeights);
    setValues(toFormValues(initialWeights));
  }

  const handleChange = (key: keyof UpdateSearchRankingWeightsInput, rawValue: string) => {
    setSavedMessage(null);
    setValues((current) => ({
      ...current,
      [key]: rawValue === '' ? undefined : Number(rawValue),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedMessage(null);

    const nextErrors = validateValues(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit(values);
    setSavedMessage('บันทึกการตั้งค่าแล้ว');
  };

  return (
    <form className="space-y-6" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        {WEIGHT_FIELDS.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              type="number"
              min={0}
              step={field.step ?? '1'}
              value={values[field.key] ?? ''}
              disabled={loading || saving}
              aria-invalid={errors[field.key] ? true : undefined}
              onChange={(event) => handleChange(field.key, event.target.value)}
            />
            <p className="text-sm text-muted">{field.helper}</p>
            {errors[field.key] ? <p className="text-sm text-danger">{errors[field.key]}</p> : null}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="personalizationCap">Personalization cap (0–0.20)</Label>
        <Input
          id="personalizationCap"
          type="number"
          min={0}
          max={0.2}
          step="0.01"
          value={values.personalizationCap ?? ''}
          disabled={loading || saving}
          aria-invalid={errors.personalizationCap ? true : undefined}
          onChange={(event) => handleChange('personalizationCap', event.target.value)}
        />
        <p className="text-sm text-muted">เพดานการปรับอันดับจากพฤติกรรมผู้ใช้ (Phase 3)</p>
        {errors.personalizationCap ? (
          <p className="text-sm text-danger">{errors.personalizationCap}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading || saving} aria-busy={saving}>
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </Button>
        {savedMessage ? <p className="text-sm text-brand">{savedMessage}</p> : null}
      </div>
    </form>
  );
}
