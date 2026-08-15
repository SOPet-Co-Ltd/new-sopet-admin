'use client';

import { useId } from 'react';
import { commissionCopy } from '@/lib/i18n/th';
import { formatBreakdownAmount } from '@/lib/payouts/commission-display';
import { cn } from '@/lib/utils';

type MoneyTone = 'muted' | 'success' | 'total';

function MoneyRow({
  label,
  amount,
  tone = 'muted',
}: {
  label: string;
  amount: string;
  tone?: MoneyTone;
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4',
        tone === 'total' && 'border-t border-border pt-3',
      )}
    >
      <dt
        className={cn(
          'text-sm',
          tone === 'total' ? 'font-semibold text-ink' : 'text-muted',
          tone === 'success' && 'text-success',
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          'tabular-nums text-sm',
          tone === 'total' && 'text-base font-semibold text-ink',
          tone === 'muted' && 'text-ink',
          tone === 'success' && 'text-success',
        )}
      >
        {amount}
      </dd>
    </div>
  );
}

type BreakdownCaptions = {
  combined?: string;
  frozen?: string;
  shipping?: string;
  payoutTime?: string;
};

type CommissionBreakdownBase = {
  audience: 'admin' | 'vendor';
  productSold: number | null;
  shippingFees: number | null;
  commissionAmount: number | null;
  netPayable: number | null;
  isLoading?: boolean;
};

export type CommissionBreakdownProps =
  | (CommissionBreakdownBase & {
      variant: 'available';
      captions: BreakdownCaptions & { combined: string };
    })
  | (CommissionBreakdownBase & {
      variant: 'snapshot';
      captions: BreakdownCaptions & { frozen: string };
    });

export function CommissionBreakdown(props: CommissionBreakdownProps) {
  const headingId = useId();
  const netLabel =
    props.audience === 'vendor'
      ? commissionCopy.breakdown.netPayable.vendor
      : commissionCopy.breakdown.netPayable.admin;

  if (props.isLoading) {
    return (
      <section className="space-y-3" aria-busy="true" aria-labelledby={headingId}>
        <h4 id={headingId} className="text-sm font-semibold text-ink">
          {commissionCopy.breakdown.heading}
        </h4>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-5 animate-pulse rounded-md bg-surface motion-reduce:animate-none"
            />
          ))}
        </div>
        <span className="sr-only">กำลังโหลดรายละเอียดยอด</span>
      </section>
    );
  }

  const rows = [
    {
      label: commissionCopy.breakdown.productSold,
      amount: props.productSold,
      tone: 'muted' as const,
    },
    {
      label: commissionCopy.breakdown.shippingFees,
      amount: props.shippingFees,
      tone: 'muted' as const,
    },
    {
      label: commissionCopy.breakdown.commissionDeducted,
      amount: props.commissionAmount,
      tone: 'muted' as const,
    },
    { label: netLabel, amount: props.netPayable, tone: 'total' as const },
  ];
  const isIncomplete = rows.some((row) => row.amount == null);

  return (
    <section className="space-y-3" aria-labelledby={headingId}>
      <h4 id={headingId} className="text-sm font-semibold text-ink">
        {commissionCopy.breakdown.heading}
      </h4>
      <dl className="space-y-2">
        {rows.map((row) => (
          <MoneyRow
            key={row.label}
            label={row.label}
            amount={formatBreakdownAmount(row.amount)}
            tone={row.tone}
          />
        ))}
      </dl>
      {props.variant === 'available' ? (
        <p className="text-xs text-muted-foreground">{props.captions.combined}</p>
      ) : (
        <p className="text-xs text-muted-foreground">{props.captions.frozen}</p>
      )}
      {props.captions.shipping ? (
        <p className="text-xs text-muted-foreground">{props.captions.shipping}</p>
      ) : null}
      {props.captions.payoutTime ? (
        <p className="text-xs text-muted-foreground">{props.captions.payoutTime}</p>
      ) : null}
      {isIncomplete ? (
        <p className="text-xs text-muted-foreground" role="status">
          {commissionCopy.breakdown.incomplete}
        </p>
      ) : null}
    </section>
  );
}
