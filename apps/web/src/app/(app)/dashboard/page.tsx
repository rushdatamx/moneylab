'use client';

import { useAuth } from '@/providers/auth-provider';
import { useUpcomingFixtures, useLiveFixtures } from '@/hooks/use-fixtures';
import { useMyLeagues } from '@/hooks/use-league';
import { useMyBets } from '@/hooks/use-bets';
import { MatchCard } from '@/components/match/match-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trophy, Target, TrendingUp, Coins, Calendar } from 'lucide-react';

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <Skeleton className="h-8 w-12 mx-auto mb-1" />
        <Skeleton className="h-3 w-20 mx-auto" />
      </CardContent>
    </Card>
  );
}

function MatchCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-6 w-12" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const { data: upcoming, isLoading: loadingUpcoming } = useUpcomingFixtures();
  const { data: live } = useLiveFixtures();
  const { data: leagues, isLoading: loadingLeagues } = useMyLeagues();
  const { data: bets, isLoading: loadingBets } = useMyBets();

  const pendingBets = bets?.filter(b => b.status === 'pending') || [];
  const wonBets = bets?.filter(b => b.status === 'won') || [];
  const isLoading = loadingUpcoming || loadingLeagues || loadingBets;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Hola, {profile?.display_name || profile?.username}
        </h1>
        <p className="text-muted-foreground">Bienvenido a MoneyLab - Mundial 2026</p>
      </div>

      {/* Quick Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{leagues?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Ligas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{pendingBets.length}</p>
              <p className="text-sm text-muted-foreground">Apuestas activas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <p className="text-2xl font-bold text-green-500">{wonBets.length}</p>
              <p className="text-sm text-muted-foreground">Ganadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Coins className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-primary">
                {wonBets.reduce((sum, b) => sum + (b.credits_won || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Puntos ganados</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Live Matches */}
      {live && live.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold">En vivo</h2>
            <Badge variant="live">LIVE</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {live.map((f) => (
              <MatchCard key={f.id} fixture={f} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Matches */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Proximos partidos</h2>
          <Link href="/partidos">
            <Button variant="ghost" size="sm">Ver todos</Button>
          </Link>
        </div>
        {loadingUpcoming ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <MatchCardSkeleton key={i} />
            ))}
          </div>
        ) : upcoming?.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {upcoming.map((f) => (
              <MatchCard key={f.id} fixture={f} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-muted-foreground">No hay partidos proximos</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Quick Actions */}
      {(!leagues || leagues.length === 0) && !loadingLeagues && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Comienza a competir</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-3">
            <Link href="/liga/crear">
              <Button className="w-full sm:w-auto">Crear liga</Button>
            </Link>
            <Link href="/liga/unirse">
              <Button variant="outline" className="w-full sm:w-auto">Unirse con codigo</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
