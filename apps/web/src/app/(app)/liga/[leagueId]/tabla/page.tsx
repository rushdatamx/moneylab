'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useLeaderboard } from '@/hooks/use-league';
import { LeaderboardTable } from '@/components/league/leaderboard-table';

export default function TablaPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const { data: entries, isLoading } = useLeaderboard(leagueId);

  if (isLoading) return <p className="text-muted-foreground">Cargando tabla...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      {entries ? (
        <LeaderboardTable entries={entries} currentUserId={user?.id} />
      ) : (
        <p className="text-muted-foreground text-center py-12">
          No se pudo cargar la tabla de posiciones
        </p>
      )}
    </div>
  );
}
