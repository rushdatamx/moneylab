'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { BetOption } from '@moneylab/shared';

interface BetOptionCardProps {
  option: BetOption;
  maxCredits: number;
  onPlaceBet: (optionId: string, credits: number) => void;
  disabled?: boolean;
}

export function BetOptionCard({
  option,
  maxCredits,
  onPlaceBet,
  disabled = false,
}: BetOptionCardProps) {
  const [credits, setCredits] = useState(0);
  const potentialWin = Math.round(credits * option.multiplier);

  return (
    <Card className={cn('transition-all', credits > 0 && 'ring-2 ring-primary')}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">{option.option_label}</span>
          <span className="text-lg font-bold text-primary tabular-nums">
            x{option.multiplier.toFixed(2)}
          </span>
        </div>

        <div className="space-y-2">
          <Slider
            value={[credits]}
            onValueChange={([v]) => setCredits(v)}
            max={maxCredits}
            min={0}
            step={5}
            disabled={disabled || maxCredits === 0}
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Apostar: <span className="font-semibold text-foreground">{credits}</span> creditos
            </span>
            {credits > 0 && (
              <span className="text-green-500 font-medium">
                Ganancia: {potentialWin} pts
              </span>
            )}
          </div>
        </div>

        {credits > 0 && (
          <Button
            className="w-full"
            onClick={() => onPlaceBet(option.id, credits)}
            disabled={disabled}
          >
            Apostar {credits} creditos
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
