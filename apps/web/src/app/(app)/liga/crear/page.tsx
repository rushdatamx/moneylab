'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateLeague } from '@/hooks/use-league';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function CrearLigaPage() {
  const router = useRouter();
  const createLeague = useCreateLeague();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(100);
  const [result, setResult] = useState<{ invitation_code: string } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const league = await createLeague.mutateAsync({
        name,
        credits_per_match: credits,
      });
      setResult(league as any);
      toast({
        title: 'Liga creada',
        description: `"${name}" lista para compartir`,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo crear la liga',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.invitation_code);
      toast({
        title: 'Codigo copiado',
        description: 'Pegalo y compartelo con tus amigos',
        variant: 'success',
      });
    }
  };

  if (result) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Liga creada</CardTitle>
            <CardDescription>Comparte el codigo con tus amigos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-3xl font-mono font-bold tracking-widest">
                {result.invitation_code}
              </p>
            </div>
            <Button variant="outline" onClick={handleCopy}>
              Copiar codigo
            </Button>
            <div>
              <Button onClick={() => router.push('/liga')}>
                Ir a mis ligas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Crear liga</CardTitle>
          <CardDescription>Crea una liga y comparte el codigo con tus amigos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre de la liga</label>
              <Input
                placeholder="Ej: Los Cracks"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Creditos por partido</label>
              <Input
                type="number"
                min={10}
                max={1000}
                value={credits}
                onChange={(e) => setCredits(parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Cada jugador recibe esta cantidad de creditos por partido para apostar
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={createLeague.isPending}>
              {createLeague.isPending ? 'Creando...' : 'Crear liga'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
