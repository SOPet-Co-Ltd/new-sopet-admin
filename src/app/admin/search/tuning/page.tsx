'use client';

import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import {
  SearchRankingWeightForm,
  SearchRankingWeightFormSkeleton,
} from '@/components/admin/search/SearchRankingWeightForm';
import { useSearchRankingWeights, useUpdateSearchRankingWeights } from '@/hooks/useSearchAdmin';

export default function AdminSearchTuningPage() {
  const { data: weights, isLoading, error } = useSearchRankingWeights();
  const updateMutation = useUpdateSearchRankingWeights();

  return (
    <div className="min-w-0 space-y-10">
      <PageHeader
        title="ปรับการจัดอันดับการค้นหา"
        description="กำหนดน้ำหนักที่รวมคะแนนผลลัพธ์ Smart Search — ค่าที่สูงกว่ามีผลต่ออันดับมากกว่า"
      />

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger"
        >
          {error instanceof Error ? error.message : 'โหลดน้ำหนักการจัดอันดับไม่สำเร็จ'}
        </p>
      ) : null}

      <section aria-labelledby="ranking-weights-heading" className="min-w-0">
        <Card>
          <CardHeader>
            <h2 id="ranking-weights-heading" className="font-medium text-ink">
              น้ำหนักการจัดอันดับ
            </h2>
            <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
              ปรับสมดุลระหว่างความเกี่ยวข้องของข้อความ ความนิยม และการตั้งค่าขั้นสูง
            </p>
          </CardHeader>
          <CardBody>
            {isLoading && !weights ? (
              <SearchRankingWeightFormSkeleton />
            ) : (
              <SearchRankingWeightForm
                initialWeights={weights}
                loading={isLoading}
                saving={updateMutation.isPending}
                onSubmit={async (input) => {
                  await updateMutation.mutateAsync(input);
                }}
              />
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
