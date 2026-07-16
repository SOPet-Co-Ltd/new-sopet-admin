import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface motion-reduce:animate-none', className)}
      aria-hidden="true"
    />
  );
}

function FormCardSkeleton({ titleWidth, rows = 2 }: { titleWidth: string; rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <SkeletonBar className={cn('h-5', titleWidth)} />
        <SkeletonBar className="mt-2 h-3.5 w-48 max-w-full" />
      </CardHeader>
      <CardBody className="space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="space-y-2">
            <SkeletonBar className="h-3.5 w-24" />
            <SkeletonBar className="h-10 w-full" />
          </div>
        ))}
        <div className="flex justify-end border-t border-border pt-4">
          <SkeletonBar className="h-10 w-28 rounded-lg" />
        </div>
      </CardBody>
    </Card>
  );
}

export function EditProductSkeleton() {
  return (
    <div aria-busy="true" aria-label="กำลังโหลดหน้าแก้ไขสินค้า">
      <div className="mb-8 space-y-3">
        <SkeletonBar className="h-4 w-40" />
        <SkeletonBar className="h-8 w-64 max-w-full" />
        <SkeletonBar className="h-4 w-56 max-w-full" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-6 lg:order-1">
          <FormCardSkeleton titleWidth="w-32" rows={2} />
          <Card>
            <CardHeader>
              <SkeletonBar className="h-5 w-28" />
              <SkeletonBar className="mt-2 h-3.5 w-56 max-w-full" />
            </CardHeader>
            <CardBody className="space-y-3">
              <SkeletonBar className="h-20 w-full rounded-lg" />
              <SkeletonBar className="h-10 w-36 rounded-lg" />
            </CardBody>
          </Card>
          <FormCardSkeleton titleWidth="w-36" rows={2} />
          <FormCardSkeleton titleWidth="w-40" rows={1} />
        </div>

        <div className="space-y-6 lg:order-2">
          <Card>
            <CardHeader>
              <SkeletonBar className="h-5 w-24" />
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-2">
                <SkeletonBar className="h-3.5 w-20" />
                <SkeletonBar className="h-10 w-full" />
              </div>
              <SkeletonBar className="h-10 w-full rounded-lg" />
              <div className="space-y-2">
                <SkeletonBar className="h-3.5 w-40" />
                <SkeletonBar className="h-4 w-full" />
                <SkeletonBar className="h-4 w-56 max-w-full" />
                <SkeletonBar className="h-4 w-48 max-w-full" />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <SkeletonBar className="h-5 w-28" />
            </CardHeader>
            <CardBody className="space-y-3">
              <SkeletonBar className="h-4 w-full" />
              <SkeletonBar className="h-4 w-3/4" />
              <SkeletonBar className="h-10 w-28 rounded-lg" />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
