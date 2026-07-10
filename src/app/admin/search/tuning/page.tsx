'use client';

import { Card, CardBody, PageHeader } from '@/components/ui/card';
import { SearchRankingWeightForm } from '@/components/admin/search/SearchRankingWeightForm';
import { useSearchRankingWeights, useUpdateSearchRankingWeights } from '@/hooks/useSearchAdmin';

export default function AdminSearchTuningPage() {
  const { data: weights, isLoading, error } = useSearchRankingWeights();
  const updateMutation = useUpdateSearchRankingWeights();

  return (
    <div>
      <PageHeader
        title="ปรับการจัดอันดับการค้นหา"
        description="กำหนดน้ำหนักการจัดอันดับผลลัพธ์ Smart Search"
      />

      {isLoading ? <p className="text-muted">กำลังโหลด...</p> : null}
      {error ? (
        <p className="text-danger">{error instanceof Error ? error.message : 'โหลดไม่สำเร็จ'}</p>
      ) : null}

      <Card>
        <CardBody>
          <SearchRankingWeightForm
            initialWeights={weights}
            loading={isLoading}
            saving={updateMutation.isPending}
            onSubmit={async (input) => {
              await updateMutation.mutateAsync(input);
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
