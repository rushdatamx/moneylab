'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTime, statusLabel, statusColor } from '@/lib/utils';
import type { FixtureWithTeams } from '@moneylab/shared';

interface MatchCardProps {
  fixture: FixtureWithTeams;
}

export function MatchCard({ fixture }: MatchCardProps) {
  const isLive = fixture.status === 'live' || fixture.status === 'halftime';
  const isFinished = fixture.status === 'finished';

  return (
    <Link href={`/partidos/${fixture.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          {/* Status & Date */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">
              {fixture.round} &middot; {formatDate(fixture.kickoff_at)}
            </span>
            {isLive ? (
              <Badge variant="live">En vivo</Badge>
            ) : (
              <span className={`text-xs font-medium ${statusColor(fixture.status)}`}>
                {statusLabel(fixture.status)}
              </span>
            )}
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex items-center gap-2 flex-1">
              {fixture.home_team.logo && (
                <Image
                  src={fixture.home_team.logo}
                  alt={fixture.home_team.name}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              )}
              <span className="font-medium text-sm truncate">
                {fixture.home_team.name}
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2 shrink-0">
              {isLive || isFinished ? (
                <>
                  <span className="text-xl font-bold tabular-nums">
                    {fixture.home_score ?? 0}
                  </span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-xl font-bold tabular-nums">
                    {fixture.away_score ?? 0}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  {formatTime(fixture.kickoff_at)}
                </span>
              )}
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="font-medium text-sm truncate text-right">
                {fixture.away_team.name}
              </span>
              {fixture.away_team.logo && (
                <Image
                  src={fixture.away_team.logo}
                  alt={fixture.away_team.name}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              )}
            </div>
          </div>

          {/* Venue */}
          {fixture.venue && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {fixture.venue}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
