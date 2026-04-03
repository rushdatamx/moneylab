# MoneyLab - FIFA World Cup 2026

## Qué es
Webapp para 10-30 amigos: stats de fútbol + apuestas virtuales (puntos, no dinero real) para el Mundial 2026. Idioma: español. UI estilo Notion.

## Stack
- **Frontend**: Next.js 14 (App Router) + shadcn/ui + Tailwind CSS → Vercel
- **Backend**: Express + TypeScript → Railway
- **Database**: Supabase (PostgreSQL + Auth)
- **Data**: API-Football Pro ($19/mo, league_id=1, season=2026)
- **Monorepo**: pnpm workspaces

## Arquitectura
```
API-Football → (cron jobs) → Railway Backend → (upsert) → Supabase DB
Next.js Frontend → (REST API) → Railway Backend → (query) → Supabase DB
Next.js Frontend → (Supabase JS client, solo auth) → Supabase
```
El frontend NUNCA llama a API-Football directamente.

## Estructura del proyecto
```
moneylab/
├── apps/web/          # Next.js (Vercel)
│   └── src/app/       # App Router pages
├── apps/api/          # Express (Railway)
│   └── src/           # config/, middleware/, routes/, controllers/, services/, cron/, utils/, types/
├── packages/shared/   # Tipos TypeScript compartidos
└── supabase/          # migrations/ + seed.sql
```

## Comandos
```bash
npx pnpm dev           # Ambos apps en paralelo
npx pnpm dev:api       # Solo backend (puerto 3001)
npx pnpm dev:web       # Solo frontend (puerto 3000)
npx pnpm build         # Build ambos
```

## Convenciones
- TypeScript estricto en todo
- Respuestas API: `{ data: T }` o `{ error: string }`
- Errores en español (mensajes al usuario)
- Auth: JWT via Supabase, header `Authorization: Bearer <token>`
- Admin endpoints: header `x-admin-key`
- Variables de entorno: ver `.env.example` en cada app

## Base de datos
- 14 tablas con RLS completo
- Triggers: auto-crear profile, validar créditos de apuesta, restaurar créditos al cancelar
- bet_types seed: match_result, over_under

## Multiplicadores
- Match Result: `(1/probabilidad) * 0.95`, rango [1.05, 15.00]
- Over/Under 2.5: Poisson distribution con stats de equipo
- Se congelan al momento de apostar

## Cron Jobs (8)
- Sync fixtures (6h), teams (diario 3AM), predictions (12h)
- Lock bets (1min), live updates (2min), resolve bets (5min)
- Generate bet options (post-predictions), aggregate stats (1h)
