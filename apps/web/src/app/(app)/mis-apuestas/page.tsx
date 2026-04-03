'use client';

import Image from 'next/image';
import { useMyBets, useCancelBet } from '@/hooks/use-bets';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Ticket } from 'lucide-react';
import Link from 'next/link';

const statusBadge: Record<string, { label: string; variant: any }> = {
  pending: { label: 'Pendiente', variant: 'secondary' },
  won: { label: 'Ganada', variant: 'success' },
  lost: { label: 'Perdida', variant: 'destructive' },
  cancelled: { label: 'Cancelada', variant: 'outline' },
  refunded: { label: 'Reembolsada', variant: 'outline' },
};

function BetSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function MisApuestasPage() {
  const { data: bets, isLoading } = useMyBets();
  const cancelBet = useCancelBet();
  const { toast } = useToast();

  const handleCancel = async (betId: string) => {
    if (confirm('Cancelar esta apuesta?')) {
      try {
        await cancelBet.mutateAsync(betId);
        toast({
          title: 'Apuesta cancelada',
          description: 'Tus creditos han sido restaurados',
          variant: 'success',
        });
      } catch {
        toast({
          title: 'Error',
          description: 'No se pudo cancelar la apuesta',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis Apuestas</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <BetSkeleton key={i} />
          ))}
        </div>
      ) : bets?.length ? (
        <div className="space-y-3">
          {bets.map((bet) => {
            const badge = statusBadge[bet.status] || statusBadge.pending;
            const fixture = bet.fixture;
            const canCancel = bet.status === 'pending' && fixture && !fixture.is_bets_locked;

            return (
              <Card key={bet.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Match */}
                      {fixture && (
                        <div className="flex items-center gap-2 text-sm flex-wrap">
                          {fixture.home_team?.logo && (
                            <Image src={fixture.home_team.logo} alt="" width={20} height={20} />
                          )}
                          <span>{fixture.home_team?.name}</span>
                          <span className="text-muted-foreground">vs</span>
                          <span>{fixture.away_team?.name}</span>
                          {fixture.away_team?.logo && (
                            <Image src={fixture.away_team.logo} alt="" width={20} height={20} />
                          )}
                        </div>
                      )}

                      {/* Bet details */}
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-medium">
                          {bet.bet_option?.option_label || 'Opcion'}
                        </span>
                        <span className="text-primary font-bold tabular-nums">
                          x{bet.multiplier_at_placement}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>Apostado: {bet.credits_wagered} creditos</span>
                        {bet.status === 'won' && (
                          <span className="text-green-500 font-medium">
                            Ganancia: {bet.credits_won} pts
                          </span>
                        )}
                        <span>{formatDateTime(bet.placed_at)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                      {canCancel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(bet.id)}
                          disabled={cancelBet.isPending}
                          className="text-xs"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Ticket className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-4">Aun no has hecho ninguna apuesta</p>
            <Link href="/partidos">
              <Button variant="outline">Ver partidos disponibles</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
