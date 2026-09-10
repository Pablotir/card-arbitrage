export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === 'N/A' || value === '') {
    return 'N/A';
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'N/A';
  return `$${num.toFixed(2)}`;
}

export function formatProfit(profit: number): { text: string; isPositive: boolean; isZero: boolean } {
  const isPositive = profit > 0;
  const isZero = Math.abs(profit) < 0.001;
  const sign = isPositive ? '+' : '';
  return {
    text: `${sign}$${profit.toFixed(2)}`,
    isPositive,
    isZero
  };
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Never';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'Never';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch {
    return dateString;
  }
}
