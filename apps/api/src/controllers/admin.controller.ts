import { Request, Response, NextFunction } from 'express';
import { syncService } from '../services/sync.service';
import { betService } from '../services/bet.service';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export async function syncTeams(_req: Request, res: Response, next: NextFunction) {
  try {
    const count = await syncService.syncTeams();
    res.json({ data: { synced: count } });
  } catch (err) {
    next(err);
  }
}

export async function syncFixtures(_req: Request, res: Response, next: NextFunction) {
  try {
    const count = await syncService.syncFixtures();
    res.json({ data: { synced: count } });
  } catch (err) {
    next(err);
  }
}

export async function syncPredictions(_req: Request, res: Response, next: NextFunction) {
  try {
    const count = await syncService.syncPredictions();
    res.json({ data: { synced: count } });
  } catch (err) {
    next(err);
  }
}

export async function generateBetOptions(_req: Request, res: Response, next: NextFunction) {
  try {
    const count = await syncService.generateBetOptionsForUpcoming();
    res.json({ data: { generated: count } });
  } catch (err) {
    next(err);
  }
}

export async function lockBets(_req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('fixtures')
      .update({ is_bets_locked: true })
      .eq('is_bets_locked', false)
      .lte('kickoff_at', now)
      .select('id');

    if (error) throw error;
    res.json({ data: { locked: data?.length || 0 } });
  } catch (err) {
    next(err);
  }
}

export async function resolveBets(_req: Request, res: Response, next: NextFunction) {
  try {
    const resolved = await betService.resolveBets();
    res.json({ data: { resolved } });
  } catch (err) {
    next(err);
  }
}

export async function recalculateLeaderboard(_req: Request, res: Response, next: NextFunction) {
  try {
    // Recalculate all league member points from resolved bets
    const { data: leagues } = await supabase.from('leagues').select('id');

    for (const league of leagues || []) {
      const { data: members } = await supabase
        .from('league_members')
        .select('user_id')
        .eq('league_id', league.id);

      for (const member of members || []) {
        const { data: wonBets } = await supabase
          .from('bets')
          .select('credits_won')
          .eq('user_id', member.user_id)
          .eq('league_id', league.id)
          .eq('status', 'won');

        const totalPoints = (wonBets || []).reduce(
          (sum, b) => sum + (b.credits_won || 0),
          0
        );

        await supabase
          .from('league_members')
          .update({ total_points: totalPoints })
          .eq('league_id', league.id)
          .eq('user_id', member.user_id);
      }
    }

    logger.info('Leaderboard recalculated');
    res.json({ data: { message: 'Leaderboard recalculado' } });
  } catch (err) {
    next(err);
  }
}
