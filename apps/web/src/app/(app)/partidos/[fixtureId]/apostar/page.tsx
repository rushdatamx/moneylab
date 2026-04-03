'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useFixture, useFixtureBetOptions } from '@/hooks/use-fixtures';
import { usePlaceBet } from '@/hooks/use-bets';
import { useMyLeagues } from '@/hooks/use-league';
import { BetOptionCard } from '@/components/betting/bet-option-card';
import { CreditsBadge } from '@/components/betting/credits-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CountdownTimer } from '@/components/match/countdown-timer';
import { useToast } from '@/hooks/use-toast';
import type { BetOption } from '@moneylab/shared';
import Link from 'next/link';

function ApostarSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-6 w-16" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-7 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </CardContent>
      </Card>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ApostarPage() {
  const { fixtureId } = useParams<{ fixtureId: string }>();
  const router = useRouter();
  const { data: fixture, isLoading: loadingFixture } = useFixture(fixtureId);
  const { data: betOptions, isLoading: loadingOptions } = useFixtureBetOptions(fixtureId);
  const { data: leagues } = useMyLeagues();
  const placeBet = usePlaceBet();
  const { toast } = useToast();
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [creditsUsed, setCreditsUsed] = useState(0);

  const league = leagues?.find(l => l.id === selectedLeague);
  const maxCredits = league ? league.credits_per_match - creditsUsed : 0;

  const handlePlaceBet = async (optionId: string, credits: number) => {
    if (!selectedLeague) {
      toast({
        title: 'Selecciona una liga',
        description: 'Necesitas seleccionar una liga para apostar',
        variant: 'destructive',
      });
      return;
    }

    try {
      await placeBet.mutateAsync({
        league_id: selectedLeague,
        fixture_id: fixtureId,
        bet_option_id: optionId,
        credits_wagered: credits,
      });
      setCreditsUsed(prev => prev + credits);
      toast({
        title: 'Apuesta colocada',
        description: `${credits} creditos apostados`,
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Error al apostar',
        description: err.message || 'Intenta de nuevo',
        variant: 'destructive',
      });
    }
  };

  if (loadingFixture || loadingOptions) return <ApostarSkeleton />;

  if (!fixture) return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <p className="text-destructive mb-4">Partido no encontrado</p>
      <Link href="/partidos">
        <Button variant="outline">Volver a partidos</Button>
      </Link>
    </div>
  );

  if (fixture.is_bets_locked || fixture.status !== 'scheduled') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-lg font-medium">Las apuestas para este partido estan cerradas</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Match Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {fixture.home_team.logo && (
                <Image src={fixture.home_team.logo} alt="" width={28} height={28} />
              )}
              <span className="font-medium text-sm">{fixture.home_team.name}</span>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Cierra en</p>
              <CountdownTimer targetDate={fixture.kickoff_at} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{fixture.away_team.name}</span>
              {fixture.away_team.logo && (
                <Image src={fixture.away_team.logo} alt="" width={28} height={28} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* League Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Selecciona tu liga</CardTitle>
        </CardHeader>
        <CardContent>
          {leagues?.length ? (
            <div className="flex flex-wrap gap-2">
              {leagues.map((l) => (
                <Button
                  key={l.id}
                  variant={selectedLeague === l.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedLeague(l.id);
                    setCreditsUsed(0);
                  }}
                >
                  {l.name}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Necesitas unirte a una liga para apostar
            </p>
          )}
          {selectedLeague && league && (
            <div className="mt-3">
              <CreditsBadge available={maxCredits} total={league.credits_per_match} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bet Options */}
      {betOptions && selectedLeague && (
        <>
          {/* Match Result */}
          {betOptions.match_result.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Resultado del partido
              </h3>
              <div className="grid gap-3">
                {betOptions.match_result.map((opt) => (
                  <BetOptionCard
                    key={opt.id}
                    option={opt as BetOption}
                    maxCredits={maxCredits}
                    onPlaceBet={handlePlaceBet}
                    disabled={placeBet.isPending}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Over/Under */}
          {betOptions.over_under.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Over/Under 2.5 goles
              </h3>
              <div className="grid gap-3">
                {betOptions.over_under.map((opt) => (
                  <BetOptionCard
                    key={opt.id}
                    option={opt as BetOption}
                    maxCredits={maxCredits}
                    onPlaceBet={handlePlaceBet}
                    disabled={placeBet.isPending}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!betOptions?.match_result?.length && !betOptions?.over_under?.length && selectedLeague && (
        <p className="text-muted-foreground text-center py-8">
          Las opciones de apuesta aun no estan disponibles para este partido
        </p>
      )}
    </div>
  );
}
