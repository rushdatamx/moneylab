'use client';

import Link from 'next/link';
import { useMyLeagues } from '@/hooks/use-league';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

function LeagueSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function LigaPage() {
  const { data: leagues, isLoading } = useMyLeagues();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis Ligas</h1>
        <div className="flex gap-2">
          <Link href="/liga/crear">
            <Button size="sm">Crear liga</Button>
          </Link>
          <Link href="/liga/unirse">
            <Button variant="outline" size="sm">Unirse</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <LeagueSkeleton key={i} />
          ))}
        </div>
      ) : leagues?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {leagues.map((league) => (
            <Link key={league.id} href={`/liga/${league.id}/tabla`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{league.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Codigo: {league.invitation_code}</span>
                    <span>{league.credits_per_match} creditos/partido</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-4">Aun no perteneces a ninguna liga</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/liga/crear">
                <Button className="w-full sm:w-auto">Crear mi primera liga</Button>
              </Link>
              <Link href="/liga/unirse">
                <Button variant="outline" className="w-full sm:w-auto">Tengo un codigo</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
