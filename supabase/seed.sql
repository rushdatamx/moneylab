-- Seed: Bet Types
INSERT INTO bet_types (slug, label, description) VALUES
  ('match_result', 'Resultado del Partido', 'Predice el resultado: Local, Empate o Visitante'),
  ('over_under', 'Over/Under 2.5 Goles', 'Predice si habra mas o menos de 2.5 goles en total')
ON CONFLICT (slug) DO NOTHING;
