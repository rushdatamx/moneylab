import cron from 'node-cron';
import { syncService } from '../services/sync.service';
import { betService } from '../services/bet.service';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export function startCronJobs() {
  logger.info('Starting cron jobs...');

  // Sync Fixtures — every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    logger.info('[CRON] Syncing fixtures...');
    try {
      await syncService.syncFixtures();
    } catch (err) {
      logger.error('[CRON] Sync fixtures failed:', err);
    }
  });

  // Sync Teams — daily at 3 AM
  cron.schedule('0 3 * * *', async () => {
    logger.info('[CRON] Syncing teams...');
    try {
      await syncService.syncTeams();
    } catch (err) {
      logger.error('[CRON] Sync teams failed:', err);
    }
  });

  // Sync Predictions — every 12 hours
  cron.schedule('0 */12 * * *', async () => {
    logger.info('[CRON] Syncing predictions...');
    try {
      const synced = await syncService.syncPredictions();
      if (synced > 0) {
        await syncService.generateBetOptionsForUpcoming();
      }
    } catch (err) {
      logger.error('[CRON] Sync predictions failed:', err);
    }
  });

  // Lock Bets — every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('fixtures')
        .update({ is_bets_locked: true })
        .eq('is_bets_locked', false)
        .lte('kickoff_at', now)
        .select('id');

      if (data?.length) {
        logger.info(`[CRON] Locked bets for ${data.length} fixtures`);
      }
    } catch (err) {
      logger.error('[CRON] Lock bets failed:', err);
    }
  });

  // Live Updates — every 2 minutes
  cron.schedule('*/2 * * * *', async () => {
    try {
      // Check if there are any live/halftime fixtures today
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('fixtures')
        .select('*', { count: 'exact', head: true })
        .in('status', ['live', 'halftime', 'scheduled'])
        .gte('kickoff_at', `${today}T00:00:00`)
        .lte('kickoff_at', `${today}T23:59:59`);

      if (count && count > 0) {
        await syncService.syncLiveData();
      }
    } catch (err) {
      logger.error('[CRON] Live updates failed:', err);
    }
  });

  // Resolve Bets — every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await betService.resolveBets();
    } catch (err) {
      logger.error('[CRON] Resolve bets failed:', err);
    }
  });

  // Update Aggregate Stats — every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('[CRON] Updating aggregate stats...');
    try {
      await updateAggregateStats();
    } catch (err) {
      logger.error('[CRON] Update aggregate stats failed:', err);
    }
  });

  logger.info('All cron jobs scheduled');
}

async function updateAggregateStats(): Promise<void> {
  const { data: teams } = await supabase.from('teams').select('id');
  if (!teams) return;

  for (const team of teams) {
    // Get all finished fixtures for this team
    const { data: fixtures } = await supabase
      .from('fixtures')
      .select('home_team_id, away_team_id, home_score, away_score')
      .eq('status', 'finished')
      .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`);

    if (!fixtures?.length) continue;

    let wins = 0, draws = 0, losses = 0, goalsScored = 0, goalsConceded = 0;

    for (const f of fixtures) {
      if (f.home_score === null || f.away_score === null) continue;
      const isHome = f.home_team_id === team.id;
      const scored = isHome ? f.home_score : f.away_score;
      const conceded = isHome ? f.away_score : f.home_score;

      goalsScored += scored;
      goalsConceded += conceded;

      if (scored > conceded) wins++;
      else if (scored < conceded) losses++;
      else draws++;
    }

    const matchesPlayed = wins + draws + losses;
    const form = fixtures
      .slice(-5)
      .map(f => {
        if (f.home_score === null || f.away_score === null) return '';
        const isHome = f.home_team_id === team.id;
        const scored = isHome ? f.home_score : f.away_score;
        const conceded = isHome ? f.away_score : f.home_score;
        if (scored > conceded) return 'W';
        if (scored < conceded) return 'L';
        return 'D';
      })
      .filter(Boolean)
      .join('');

    await supabase.from('team_aggregate_stats').upsert(
      {
        team_id: team.id,
        matches_played: matchesPlayed,
        wins,
        draws,
        losses,
        goals_scored: goalsScored,
        goals_conceded: goalsConceded,
        avg_goals_scored: matchesPlayed > 0 ? goalsScored / matchesPlayed : 0,
        avg_goals_conceded: matchesPlayed > 0 ? goalsConceded / matchesPlayed : 0,
        avg_possession: 0, // Updated from fixture_statistics separately
        form,
      },
      { onConflict: 'team_id' }
    );
  }
}
