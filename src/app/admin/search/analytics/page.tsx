'use client';

import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/card';
import { SearchAnalyticsExportButton } from '@/components/admin/search/SearchAnalyticsExportButton';
import {
  useExportSearchAnalyticsCsv,
  useSearchAnalyticsSuggestionCtr,
  useSearchAnalyticsSummary,
  useSearchAnalyticsTopQueries,
  useSearchAnalyticsZeroResultQueries,
} from '@/hooks/useSearchAdmin';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardBody>
        <p className="min-w-0 text-sm text-muted">{label}</p>
        <p className="mt-2 break-words font-display text-xl font-semibold tabular-nums text-ink sm:text-2xl">
          {value}
        </p>
      </CardBody>
    </Card>
  );
}

function QueryTable({
  title,
  rows,
  loading,
  error,
}: {
  title: string;
  rows: Array<{ query: string; searchCount: number; avgResultCount: number }>;
  loading: boolean;
  error: Error | null;
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      </CardHeader>
      <CardBody>
        {loading ? <p className="text-muted">กำลังโหลดข้อมูล...</p> : null}
        {error ? <p className="text-danger">{error.message}</p> : null}
        {!loading && !error && rows.length === 0 ? (
          <p className="text-muted">ยังไม่มีข้อมูล</p>
        ) : null}
        {!loading && !error && rows.length > 0 ? (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li
                key={row.query}
                className="flex min-w-0 items-center justify-between gap-4 rounded-lg border border-border px-4 py-3"
              >
                <span className="min-w-0 truncate">{row.query}</span>
                <span className="shrink-0 text-sm text-muted">
                  {row.searchCount} ครั้ง · เฉลี่ย {row.avgResultCount.toFixed(1)} ผลลัพธ์
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardBody>
    </Card>
  );
}

export default function AdminSearchAnalyticsPage() {
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useSearchAnalyticsSummary();
  const {
    data: topQueries = [],
    isLoading: topLoading,
    error: topError,
  } = useSearchAnalyticsTopQueries();
  const {
    data: zeroResultQueries = [],
    isLoading: zeroLoading,
    error: zeroError,
  } = useSearchAnalyticsZeroResultQueries();
  const {
    data: suggestionCtr = [],
    isLoading: ctrLoading,
    error: ctrError,
  } = useSearchAnalyticsSuggestionCtr();
  const exportMutation = useExportSearchAnalyticsCsv();

  const handleExport = async () => {
    const csv = await exportMutation.mutateAsync({});
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'search-analytics.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-w-0">
      <PageHeader
        title="วิเคราะห์การค้นหา"
        description="สรุปการใช้งาน Smart Search 7 วันล่าสุด"
        action={
          <SearchAnalyticsExportButton
            disabled={summaryLoading || Boolean(summaryError)}
            loading={exportMutation.isPending}
            onExport={handleExport}
          />
        }
      />

      {summaryLoading ? <p className="text-muted">กำลังโหลด...</p> : null}
      {summaryError ? (
        <p className="text-danger">
          {summaryError instanceof Error ? summaryError.message : 'โหลดไม่สำเร็จ'}
        </p>
      ) : null}

      {summary ? (
        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="การค้นหาทั้งหมด" value={summary.totalSearches} />
          <StatCard label="คำค้นหาไม่ซ้ำ" value={summary.uniqueQueries} />
          <StatCard
            label="อัตราไม่พบผลลัพธ์"
            value={`${(summary.zeroResultRate * 100).toFixed(1)}%`}
          />
          <StatCard label="ผลลัพธ์เฉลี่ยต่อคำค้นหา" value={summary.avgResultsPerQuery.toFixed(1)} />
        </div>
      ) : null}

      <div className="mt-8 grid min-w-0 gap-6 xl:grid-cols-2">
        <QueryTable
          title="คำค้นหายอดนิยม"
          rows={topQueries}
          loading={topLoading}
          error={topError}
        />
        <QueryTable
          title="คำค้นหาที่ไม่พบผลลัพธ์"
          rows={zeroResultQueries}
          loading={zeroLoading}
          error={zeroError}
        />
      </div>

      <div className="mt-6 min-w-0">
        <Card className="min-w-0">
          <CardHeader>
            <h2 className="font-display text-lg font-semibold text-ink">
              CTR คำแนะนำตาม prefix bucket
            </h2>
          </CardHeader>
          <CardBody>
            {ctrLoading ? <p className="text-muted">กำลังโหลดข้อมูล...</p> : null}
            {ctrError ? (
              <p className="text-danger">
                {ctrError instanceof Error ? ctrError.message : 'โหลดไม่สำเร็จ'}
              </p>
            ) : null}
            {!ctrLoading && !ctrError && suggestionCtr.length === 0 ? (
              <p className="text-muted">ยังไม่มีข้อมูล</p>
            ) : null}
            {!ctrLoading && !ctrError && suggestionCtr.length > 0 ? (
              <ul className="space-y-2">
                {suggestionCtr.map((row) => (
                  <li
                    key={row.prefixBucket}
                    className="flex min-w-0 items-center justify-between gap-4 rounded-lg border border-border px-4 py-3"
                  >
                    <span className="min-w-0 truncate">{row.prefixBucket}</span>
                    <span className="shrink-0 text-right text-sm text-muted">
                      {row.impressions} impressions · {(row.ctr * 100).toFixed(1)}% CTR
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
