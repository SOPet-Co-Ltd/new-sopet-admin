export function providerLabel(
  providers: { id: string; name: string }[],
  providerId?: string,
): string {
  if (!providerId) return 'ไม่ระบุผู้ให้บริการ';
  return providers.find((p) => p.id === providerId)?.name ?? 'ไม่ระบุผู้ให้บริการ';
}

export function activeStatusBadgeClass(isActive: boolean): string {
  return isActive
    ? 'border border-success/25 bg-success-bg text-success'
    : 'border border-border bg-surface text-muted-foreground';
}
