'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@moneylab/shared';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tabla de Posiciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-[2rem_1fr_4rem_4rem_4rem_5rem] gap-2 px-3 py-2 text-xs text-muted-foreground font-medium">
            <span>#</span>
            <span>Jugador</span>
            <span className="text-center">G</span>
            <span className="text-center">P</span>
            <span className="text-center">Total</span>
            <span className="text-right">Puntos</span>
          </div>

          {entries.map((entry) => (
            <div
              key={entry.user_id}
              className={cn(
                'grid grid-cols-[2rem_1fr_4rem_4rem_4rem_5rem] gap-2 px-3 py-2 rounded-md items-center',
                currentUserId === entry.user_id && 'bg-primary/10',
                entry.rank <= 3 && 'font-medium'
              )}
            >
              <span className={cn(
                'text-sm tabular-nums',
                entry.rank === 1 && 'text-yellow-500',
                entry.rank === 2 && 'text-gray-400',
                entry.rank === 3 && 'text-amber-700'
              )}>
                {entry.rank}
              </span>

              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={entry.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {(entry.display_name || entry.username).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm truncate">
                  {entry.display_name || entry.username}
                </span>
              </div>

              <span className="text-sm text-center tabular-nums text-green-500">
                {entry.bets_won}
              </span>
              <span className="text-sm text-center tabular-nums text-red-500">
                {entry.bets_lost}
              </span>
              <span className="text-sm text-center tabular-nums text-muted-foreground">
                {entry.bets_total}
              </span>
              <span className="text-sm text-right tabular-nums font-semibold">
                {entry.total_points.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
