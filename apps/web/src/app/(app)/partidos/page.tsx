'use client';

import { useState } from 'react';
import { useFixtures } from '@/hooks/use-fixtures';
import { MatchCard } from '@/components/match/match-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Trophy } from 'lucide-react';

const statusFilters = [
  { label: 'Todos', value: '' },
  { label: 'Programados', value: 'scheduled' },
  { label: 'En vivo', value: 'live' },
  { label: 'Finalizados', value: 'finished' },
];

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
        <div className="flex justify-between mt-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function PartidosPage() {
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const { data: fixtures, isLoading } = useFixtures(
    Object.fromEntries(
      Object.entries({ status, date }).filter(([, v]) => v)
    )
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Partidos</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 flex-wrap">
          {statusFilters.map((f) => (
            <Button
              key={f.value}
              variant={status === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatus(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-auto"
          />
          {date && (
            <Button variant="ghost" size="sm" onClick={() => setDate('')}>
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Fixtures */}
      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      ) : fixtures?.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {fixtures.map((f) => (
            <MatchCard key={f.id} fixture={f} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              {status === 'live' ? (
                <Trophy className="h-10 w-10 text-muted-foreground/50" />
              ) : (
                <Calendar className="h-10 w-10 text-muted-foreground/50" />
              )}
              <p className="text-muted-foreground">
                {status === 'live'
                  ? 'No hay partidos en vivo en este momento'
                  : status === 'scheduled'
                  ? 'No hay partidos programados'
                  : status === 'finished'
                  ? 'No hay partidos finalizados'
                  : 'No se encontraron partidos'}
              </p>
              {(status || date) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setStatus(''); setDate(''); }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
