import { Card, CardBody } from '@/components/ui/card';

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-surface ${className ?? ''}`} aria-hidden="true" />
  );
}

export function VendorDashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="กำลังโหลดแดชบอร์ด">
      <div className="space-y-2">
        <SkeletonBar className="h-8 w-48" />
        <SkeletonBar className="h-4 w-72 max-w-full" />
      </div>

      <div className="space-y-3">
        <SkeletonBar className="h-6 w-40" />
        <SkeletonBar className="h-4 w-56" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardBody className="space-y-2">
                <SkeletonBar className="h-5 w-32" />
                <SkeletonBar className="h-4 w-48" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SkeletonBar className="h-6 w-44" />
        <SkeletonBar className="h-4 w-64" />
        <Card>
          <CardBody className="space-y-2">
            <SkeletonBar className="h-4 w-24" />
            <SkeletonBar className="h-8 w-32" />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardBody className="space-y-2">
              <SkeletonBar className="h-4 w-24" />
              <SkeletonBar className="h-8 w-16" />
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
