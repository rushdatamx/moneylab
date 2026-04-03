'use client';

import { cn } from '@/lib/utils';

interface StatBarProps {
  label: string;
  homeValue: number;
  awayValue: number;
  isPercentage?: boolean;
}

export function StatBar({ label, homeValue, awayValue, isPercentage = false }: StatBarProps) {
  const total = homeValue + awayValue || 1;
  const homePercent = (homeValue / total) * 100;
  const awayPercent = (awayValue / total) * 100;

  const homeLead = homeValue > awayValue;
  const awayLead = awayValue > homeValue;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className={cn('tabular-nums', homeLead && 'font-semibold')}>
          {isPercentage ? `${homeValue}%` : homeValue}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn('tabular-nums', awayLead && 'font-semibold')}>
          {isPercentage ? `${awayValue}%` : awayValue}
        </span>
      </div>
      <div className="flex h-2 gap-1 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-l-full transition-all',
            homeLead ? 'bg-primary' : 'bg-muted-foreground/30'
          )}
          style={{ width: `${homePercent}%` }}
        />
        <div
          className={cn(
            'h-full rounded-r-full transition-all',
            awayLead ? 'bg-primary' : 'bg-muted-foreground/30'
          )}
          style={{ width: `${awayPercent}%` }}
        />
      </div>
    </div>
  );
}
