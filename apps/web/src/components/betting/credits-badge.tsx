'use client';

import { Badge } from '@/components/ui/badge';

interface CreditsBadgeProps {
  available: number;
  total: number;
}

export function CreditsBadge({ available, total }: CreditsBadgeProps) {
  const pct = (available / total) * 100;

  return (
    <Badge variant={pct > 50 ? 'success' : pct > 0 ? 'warning' : 'destructive'}>
      {available}/{total} creditos
    </Badge>
  );
}
