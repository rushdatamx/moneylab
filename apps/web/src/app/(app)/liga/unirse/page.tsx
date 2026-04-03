'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJoinLeague } from '@/hooks/use-league';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function UnirseLigaPage() {
  const router = useRouter();
  const joinLeague = useJoinLeague();
  const { toast } = useToast();
  const [code, setCode] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await joinLeague.mutateAsync({ invitation_code: code });
      toast({
        title: 'Te has unido a la liga',
        description: 'Ya puedes empezar a apostar',
        variant: 'success',
      });
      router.push('/liga');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo unir a la liga',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Unirse a una liga</CardTitle>
          <CardDescription>Ingresa el codigo de invitacion que te compartieron</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Codigo de invitacion</label>
              <Input
                placeholder="Ej: a1b2c3d4"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="text-center font-mono text-lg tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full" disabled={joinLeague.isPending}>
              {joinLeague.isPending ? 'Uniendose...' : 'Unirme'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
