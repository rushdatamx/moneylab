'use client';

import { cn } from '@/lib/utils';
import type { FixtureEvent } from '@moneylab/shared';

interface MatchTimelineProps {
  events: FixtureEvent[];
  homeTeamId: string;
}

const eventIcons: Record<string, string> = {
  Goal: '⚽',
  Card: '🟨',
  subst: '🔄',
  Var: '📺',
};

function getEventIcon(type: string, detail: string | null) {
  if (type === 'Card' && detail === 'Red Card') return '🟥';
  if (type === 'Card' && detail === 'Yellow Card') return '🟨';
  if (type === 'Goal' && detail === 'Penalty') return '⚽ (P)';
  if (type === 'Goal' && detail === 'Own Goal') return '⚽ (AG)';
  return eventIcons[type] || '•';
}

export function MatchTimeline({ events, homeTeamId }: MatchTimelineProps) {
  if (!events.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No hay eventos disponibles
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => {
        const isHome = event.team_id === homeTeamId;
        return (
          <div
            key={event.id}
            className={cn(
              'flex items-center gap-3 py-2 px-3 rounded-md',
              isHome ? 'flex-row' : 'flex-row-reverse'
            )}
          >
            <span className="text-xs font-mono text-muted-foreground shrink-0 w-10 text-center">
              {event.minute}&apos;{event.extra_minute ? `+${event.extra_minute}` : ''}
            </span>

            <span className="text-base shrink-0">
              {getEventIcon(event.event_type, event.detail)}
            </span>

            <div className={cn('flex-1', !isHome && 'text-right')}>
              <p className="text-sm font-medium">{event.player_name}</p>
              {event.assist_name && (
                <p className="text-xs text-muted-foreground">
                  Asistencia: {event.assist_name}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
