'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useFixture, useFixtureH2H } from '@/hooks/use-fixtures';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatBar } from '@/components/match/stat-bar';
import { MatchTimeline } from '@/components/match/match-timeline';
import { CountdownTimer } from '@/components/match/countdown-timer';
import { statusLabel, formatDateTime } from '@/lib/utils';

function FixtureDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 text-center">
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
            <Skeleton className="h-10 w-24" />
            <div className="flex-1 text-center">
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-10 w-full rounded-md" />
      <Card>
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function FixtureDetailPage() {
  const { fixtureId } = useParams<{ fixtureId: string }>();
  const { data: fixture, isLoading } = useFixture(fixtureId);
  const { data: h2h } = useFixtureH2H(fixtureId);

  if (isLoading) return <FixtureDetailSkeleton />;
  if (!fixture) return (
    <div className="text-center py-12">
      <p className="text-destructive mb-4">Partido no encontrado</p>
      <Link href="/partidos">
        <Button variant="outline">Volver a partidos</Button>
      </Link>
    </div>
  );

  const isLive = fixture.status === 'live' || fixture.status === 'halftime';
  const isScheduled = fixture.status === 'scheduled';
  const homeStats = fixture.statistics?.find(s => s.team_id === fixture.home_team_id);
  const awayStats = fixture.statistics?.find(s => s.team_id === fixture.away_team_id);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Match Header */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">{fixture.round}</p>
            {isLive && <Badge variant="live" className="mt-1">En vivo</Badge>}
            {isScheduled && (
              <div className="mt-1">
                <CountdownTimer targetDate={fixture.kickoff_at} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 sm:gap-6">
            {/* Home */}
            <div className="flex-1 text-center">
              {fixture.home_team.logo && (
                <Image
                  src={fixture.home_team.logo}
                  alt={fixture.home_team.name}
                  width={64}
                  height={64}
                  className="mx-auto mb-2 w-12 h-12 sm:w-16 sm:h-16"
                />
              )}
              <p className="font-semibold text-sm sm:text-base">{fixture.home_team.name}</p>
            </div>

            {/* Score */}
            <div className="text-center">
              {isLive || fixture.status === 'finished' ? (
                <p className="text-3xl sm:text-4xl font-bold tabular-nums">
                  {fixture.home_score} - {fixture.away_score}
                </p>
              ) : (
                <p className="text-sm sm:text-lg text-muted-foreground">
                  {formatDateTime(fixture.kickoff_at)}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {statusLabel(fixture.status)}
              </p>
            </div>

            {/* Away */}
            <div className="flex-1 text-center">
              {fixture.away_team.logo && (
                <Image
                  src={fixture.away_team.logo}
                  alt={fixture.away_team.name}
                  width={64}
                  height={64}
                  className="mx-auto mb-2 w-12 h-12 sm:w-16 sm:h-16"
                />
              )}
              <p className="font-semibold text-sm sm:text-base">{fixture.away_team.name}</p>
            </div>
          </div>

          {fixture.venue && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              {fixture.venue}
            </p>
          )}

          {isScheduled && !fixture.is_bets_locked && (
            <div className="mt-4 text-center">
              <Link href={`/partidos/${fixtureId}/apostar`}>
                <Button>Apostar en este partido</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="stats">
        <TabsList className="w-full">
          <TabsTrigger value="stats" className="flex-1">Estadisticas</TabsTrigger>
          <TabsTrigger value="events" className="flex-1">Eventos</TabsTrigger>
          <TabsTrigger value="h2h" className="flex-1">H2H</TabsTrigger>
          <TabsTrigger value="predictions" className="flex-1">Predicciones</TabsTrigger>
        </TabsList>

        {/* Statistics */}
        <TabsContent value="stats">
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {homeStats && awayStats ? (
                <>
                  <StatBar label="Posesion" homeValue={homeStats.possession_pct || 0} awayValue={awayStats.possession_pct || 0} isPercentage />
                  <StatBar label="Tiros totales" homeValue={homeStats.shots_total || 0} awayValue={awayStats.shots_total || 0} />
                  <StatBar label="Tiros a puerta" homeValue={homeStats.shots_on_goal || 0} awayValue={awayStats.shots_on_goal || 0} />
                  <StatBar label="Pases" homeValue={homeStats.passes_total || 0} awayValue={awayStats.passes_total || 0} />
                  <StatBar label="Corners" homeValue={homeStats.corners || 0} awayValue={awayStats.corners || 0} />
                  <StatBar label="Faltas" homeValue={homeStats.fouls || 0} awayValue={awayStats.fouls || 0} />
                  <StatBar label="Tarjetas amarillas" homeValue={homeStats.yellow_cards || 0} awayValue={awayStats.yellow_cards || 0} />
                  <StatBar label="Tarjetas rojas" homeValue={homeStats.red_cards || 0} awayValue={awayStats.red_cards || 0} />
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Estadisticas no disponibles
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events */}
        <TabsContent value="events">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <MatchTimeline
                events={fixture.events || []}
                homeTeamId={fixture.home_team_id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* H2H */}
        <TabsContent value="h2h">
          <Card>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {h2h ? (
                <>
                  <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div>
                      <p className="text-2xl font-bold">{h2h.summary.home_wins}</p>
                      <p className="text-xs text-muted-foreground">{fixture.home_team.name}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{h2h.summary.draws}</p>
                      <p className="text-xs text-muted-foreground">Empates</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{h2h.summary.away_wins}</p>
                      <p className="text-xs text-muted-foreground">{fixture.away_team.name}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {h2h.fixtures.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                        <span className="truncate flex-1">{f.home_team.name}</span>
                        <span className="font-bold mx-3 tabular-nums">
                          {f.home_score} - {f.away_score}
                        </span>
                        <span className="truncate flex-1 text-right">{f.away_team.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Historial no disponible
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions */}
        <TabsContent value="predictions">
          <Card>
            <CardContent className="p-4 sm:p-6">
              {fixture.predictions ? (
                <div className="space-y-4">
                  {fixture.predictions.advice && (
                    <p className="text-center font-medium text-primary">
                      {fixture.predictions.advice}
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div className="p-3 sm:p-4 rounded-lg bg-muted">
                      <p className="text-xl sm:text-2xl font-bold">{fixture.predictions.pct_home}%</p>
                      <p className="text-xs text-muted-foreground">Local</p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-lg bg-muted">
                      <p className="text-xl sm:text-2xl font-bold">{fixture.predictions.pct_draw}%</p>
                      <p className="text-xs text-muted-foreground">Empate</p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-lg bg-muted">
                      <p className="text-xl sm:text-2xl font-bold">{fixture.predictions.pct_away}%</p>
                      <p className="text-xs text-muted-foreground">Visitante</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Predicciones no disponibles
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
