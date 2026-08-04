'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AnalyticsPanel } from '@/components/analytics/analytics-panel';
import { PlatformRankedList } from '@/components/analytics/platform-ranked-list';
import {
  PlatformStatCard,
  PlatformStatGridSkeleton,
} from '@/components/analytics/platform-stat-card';
import { SearchAnalyticsExportButton } from '@/components/admin/search/SearchAnalyticsExportButton';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/card';
import {
  useExportSearchAnalyticsCsv,
  useSearchAnalyticsSuggestionCtr,
  useSearchAnalyticsSummary,
  useSearchAnalyticsTopQueries,
  useSearchAnalyticsZeroResultQueries,
} from '@/hooks/useSearchAdmin';

const INITIAL_LIST_LIMIT = 10;
const LIST_STEP = 20;
const MAX_LIST_LIMIT = 50;

function formatCount(value: number) {
  return value.toLocaleString('th-TH');
}

function formatRate(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatAverage(value: number) {
  return value.toLocaleString('th-TH', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function usePagedLimit(initial = INITIAL_LIST_LIMIT, step = LIST_STEP, max = MAX_LIST_LIMIT) {
  const [limit, setLimit] = useState(initial);

  return {
    limit,
    isExpanded: limit > initial,
    canExpand: limit < max,
    expand: () => setLimit((current) => Math.min(current + step, max)),
    collapse: () => setLimit(initial),
  };
}

function RankedListExpandControls({
  shownCount,
  limit,
  maxLimit,
  totalAvailable,
  isExpanded,
  canRequestMore,
  loading,
  onExpand,
  onCollapse,
}: {
  shownCount: number;
  limit: number;
  maxLimit: number;
  /** Known total when already loaded (CTR). Omit for server-paged lists. */
  totalAvailable?: number;
  isExpanded: boolean;
  canRequestMore: boolean;
  loading?: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}) {
  const mayHaveMore =
    canRequestMore &&
    (totalAvailable != null
      ? shownCount < Math.min(totalAvailable, maxLimit)
      : shownCount >= limit);

  if (!mayHaveMore && !isExpanded) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      <p className="text-sm text-muted-foreground">
        แสดง {formatCount(shownCount)}
        {totalAvailable != null
          ? ` จาก ${formatCount(Math.min(totalAvailable, maxLimit))} รายการ`
          : mayHaveMore
            ? ` จากอย่างน้อย ${formatCount(shownCount)} รายการ`
            : ' รายการ'}
      </p>
      <div className="flex flex-wrap gap-2">
        {isExpanded ? (
          <Button type="button" size="sm" variant="ghost" onClick={onCollapse}>
            แสดงน้อยลง
          </Button>
        ) : null}
        {mayHaveMore ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading}
            aria-busy={loading}
            onClick={onExpand}
          >
            {loading ? 'กำลังโหลด...' : 'ดูเพิ่ม'}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function RankedPanelBody({
  loading,
  items,
  expand,
}: {
  loading: boolean;
  items: Array<{ key: string; primary: ReactNode; secondary: ReactNode }>;
  expand?: ReactNode;
}) {
  return (
    <>
      <PlatformRankedList loading={loading} items={items} />
      {!loading ? expand : null}
    </>
  );
}

export default function AdminSearchAnalyticsPage() {
  const topPaging = usePagedLimit();
  const zeroPaging = usePagedLimit();
  const ctrPaging = usePagedLimit();

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useSearchAnalyticsSummary();
  const {
    data: topQueries = [],
    isLoading: topLoading,
    isFetching: topFetching,
    error: topError,
  } = useSearchAnalyticsTopQueries(undefined, undefined, topPaging.limit);
  const {
    data: zeroResultQueries = [],
    isLoading: zeroLoading,
    isFetching: zeroFetching,
    error: zeroError,
  } = useSearchAnalyticsZeroResultQueries(undefined, undefined, zeroPaging.limit);
  const {
    data: suggestionCtr = [],
    isLoading: ctrLoading,
    error: ctrError,
  } = useSearchAnalyticsSuggestionCtr();
  const exportMutation = useExportSearchAnalyticsCsv();

  const visibleSuggestionCtr = suggestionCtr.slice(0, ctrPaging.limit);

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
    <div className="min-w-0 space-y-10">
      <PageHeader
        title="วิเคราะห์การค้นหา"
        description="สรุปการใช้งาน Smart Search 7 วันล่าสุด — ใช้ตัวเลขนี้เพื่อปรับคำพ้องและความสำคัญของผลลัพธ์"
        action={
          <SearchAnalyticsExportButton
            disabled={summaryLoading || Boolean(summaryError)}
            loading={exportMutation.isPending}
            onExport={handleExport}
          />
        }
      />

      {summaryError ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger"
        >
          {summaryError instanceof Error ? summaryError.message : 'โหลดข้อมูลสรุปไม่สำเร็จ'}
        </p>
      ) : null}

      <section aria-labelledby="search-kpi-heading" className="min-w-0">
        <div className="mb-4">
          <h2 id="search-kpi-heading" className="text-lg font-medium text-ink">
            ภาพรวมการค้นหา
          </h2>
          <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
            ปริมาณคำค้นและคุณภาพผลลัพธ์ในช่วง 7 วัน
          </p>
        </div>

        {summaryLoading ? (
          <PlatformStatGridSkeleton count={5} />
        ) : summary ? (
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <PlatformStatCard label="การค้นหาทั้งหมด" value={formatCount(summary.totalSearches)} />
            <PlatformStatCard label="คำค้นหาไม่ซ้ำ" value={formatCount(summary.uniqueQueries)} />
            <PlatformStatCard
              label="อัตราไม่พบผลลัพธ์"
              value={formatRate(summary.zeroResultRate)}
              hint="สูงเกินไป? เพิ่มคำพ้องความหมาย"
              href="/admin/search/synonyms"
            />
            <PlatformStatCard
              label="ผลลัพธ์เฉลี่ยต่อคำค้นหา"
              value={formatAverage(summary.avgResultsPerQuery)}
            />
            <PlatformStatCard
              label="เวลาตอบสนองเฉลี่ย"
              value={`${formatCount(Math.round(summary.avgLatencyMs ?? 0))} ms`}
              hint="ปรับน้ำหนักได้ที่หน้าจัดอันดับ"
              href="/admin/search/tuning"
            />
          </div>
        ) : null}
      </section>

      <section aria-labelledby="search-queries-heading" className="min-w-0 space-y-6">
        <div>
          <h2 id="search-queries-heading" className="text-lg font-medium text-ink">
            คำค้นหาที่ควรติดตาม
          </h2>
          <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
            แสดง {INITIAL_LIST_LIMIT} อันดับแรกก่อน — กดดูเพิ่มเมื่อต้องการเจาะลึก · ส่งออก CSV
            สำหรับชุดข้อมูลเต็ม
          </p>
        </div>

        <div className="grid min-w-0 gap-6 xl:grid-cols-2">
          <AnalyticsPanel
            title="คำค้นหายอดนิยม"
            description={`เรียงตามจำนวนครั้งที่ค้นหา · โหลดทีละไม่เกิน ${MAX_LIST_LIMIT} รายการ`}
            loading={topLoading}
            error={topError}
            loadingFallback={<PlatformRankedList loading items={[]} />}
          >
            <RankedPanelBody
              loading={false}
              items={topQueries.map((row) => ({
                key: row.query,
                primary: (
                  <p className="min-w-0 truncate font-medium text-ink" title={row.query}>
                    {row.query}
                  </p>
                ),
                secondary: (
                  <>
                    <p className="tabular-nums text-ink">{formatCount(row.searchCount)} ครั้ง</p>
                    <p className="tabular-nums text-muted-foreground">
                      เฉลี่ย {formatAverage(row.avgResultCount)} ผลลัพธ์
                    </p>
                  </>
                ),
              }))}
              expand={
                <RankedListExpandControls
                  shownCount={topQueries.length}
                  limit={topPaging.limit}
                  maxLimit={MAX_LIST_LIMIT}
                  isExpanded={topPaging.isExpanded}
                  canRequestMore={topPaging.canExpand}
                  loading={topFetching && !topLoading}
                  onExpand={topPaging.expand}
                  onCollapse={topPaging.collapse}
                />
              }
            />
          </AnalyticsPanel>

          <AnalyticsPanel
            title="คำค้นหาที่ไม่พบผลลัพธ์"
            description={
              <>
                โอกาสเพิ่มความครอบคลุม —{' '}
                <Link
                  href="/admin/search/synonyms"
                  className="font-medium text-secondary transition-colors hover:text-secondary-hover focus-visible:outline-none focus-visible:underline"
                >
                  จัดการคำพ้องความหมาย
                </Link>
              </>
            }
            loading={zeroLoading}
            error={zeroError}
            loadingFallback={<PlatformRankedList loading items={[]} />}
          >
            <RankedPanelBody
              loading={false}
              items={zeroResultQueries.map((row) => ({
                key: row.query,
                primary: (
                  <p className="min-w-0 truncate font-medium text-ink" title={row.query}>
                    {row.query}
                  </p>
                ),
                secondary: (
                  <p className="tabular-nums text-ink">{formatCount(row.searchCount)} ครั้ง</p>
                ),
              }))}
              expand={
                <RankedListExpandControls
                  shownCount={zeroResultQueries.length}
                  limit={zeroPaging.limit}
                  maxLimit={MAX_LIST_LIMIT}
                  isExpanded={zeroPaging.isExpanded}
                  canRequestMore={zeroPaging.canExpand}
                  loading={zeroFetching && !zeroLoading}
                  onExpand={zeroPaging.expand}
                  onCollapse={zeroPaging.collapse}
                />
              }
            />
          </AnalyticsPanel>
        </div>
      </section>

      <section aria-labelledby="search-suggestions-heading" className="min-w-0">
        <div className="mb-4">
          <h2 id="search-suggestions-heading" className="text-lg font-medium text-ink">
            ประสิทธิภาพคำแนะนำ
          </h2>
          <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
            อัตราคลิกคำแนะนำตามกลุ่ม prefix — แสดงทีละชุดเพื่อให้สแกนได้เร็ว
          </p>
        </div>

        <AnalyticsPanel
          title="CTR ตาม prefix"
          description="จำนวนครั้งที่แสดงคำแนะนำและอัตราการคลิก"
          loading={ctrLoading}
          error={ctrError}
          loadingFallback={<PlatformRankedList loading items={[]} />}
        >
          <RankedPanelBody
            loading={false}
            items={visibleSuggestionCtr.map((row) => ({
              key: row.prefixBucket,
              primary: (
                <p className="min-w-0 truncate font-medium text-ink" title={row.prefixBucket}>
                  <span className="text-muted-foreground">prefix </span>
                  {row.prefixBucket}
                </p>
              ),
              secondary: (
                <>
                  <p className="tabular-nums text-ink">{formatRate(row.ctr)} CTR</p>
                  <p className="tabular-nums text-muted-foreground">
                    {formatCount(row.impressions)} ครั้งที่แสดง
                  </p>
                </>
              ),
            }))}
            expand={
              <RankedListExpandControls
                shownCount={visibleSuggestionCtr.length}
                limit={ctrPaging.limit}
                maxLimit={MAX_LIST_LIMIT}
                totalAvailable={suggestionCtr.length}
                isExpanded={ctrPaging.isExpanded}
                canRequestMore={ctrPaging.canExpand}
                onExpand={ctrPaging.expand}
                onCollapse={ctrPaging.collapse}
              />
            }
          />
        </AnalyticsPanel>
      </section>
    </div>
  );
}
