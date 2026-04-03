import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Money<span className="text-primary">Lab</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Apuestas virtuales entre amigos para el Mundial 2026.
          Estadisticas, predicciones y competencia en tiempo real.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/registro">
            <Button size="lg">Crear cuenta</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Iniciar sesion</Button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-6 pt-8 text-center">
          <div>
            <p className="text-3xl font-bold text-primary">48</p>
            <p className="text-sm text-muted-foreground">Selecciones</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">104</p>
            <p className="text-sm text-muted-foreground">Partidos</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">100</p>
            <p className="text-sm text-muted-foreground">Creditos/partido</p>
          </div>
        </div>
      </div>
    </div>
  );
}
