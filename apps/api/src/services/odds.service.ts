import { supabase } from '../config/supabase';
import { calculateMultiplier, poissonUnderProbability } from '../utils/math';
import { logger } from '../utils/logger';

class OddsService {
  /**
   * Generate bet options for a fixture based on predictions and team stats
   */
  async generateBetOptions(fixtureId: string): Promise<void> {
    // Get prediction data
    const { data: prediction } = await supabase
      .from('predictions_cache')
      .select('*')
      .eq('fixture_id', fixtureId)
      .single();

    if (!prediction) {
      logger.warn(`No predictions found for fixture ${fixtureId}, skipping bet options`);
      return;
    }

    // Get bet types
    const { data: betTypes } = await supabase
      .from('bet_types')
      .select('*');

    if (!betTypes?.length) return;

    const matchResultType = betTypes.find(bt => bt.slug === 'match_result');
    const overUnderType = betTypes.find(bt => bt.slug === 'over_under');

    const options: Array<{
      fixture_id: string;
      bet_type_id: string;
      option_label: string;
      option_value: string;
      multiplier: number;
    }> = [];

    // Match Result (1X2) options
    if (matchResultType) {
      const pctHome = prediction.pct_home / 100;
      const pctDraw = prediction.pct_draw / 100;
      const pctAway = prediction.pct_away / 100;

      options.push(
        {
          fixture_id: fixtureId,
          bet_type_id: matchResultType.id,
          option_label: 'Local',
          option_value: 'home',
          multiplier: calculateMultiplier(pctHome),
        },
        {
          fixture_id: fixtureId,
          bet_type_id: matchResultType.id,
          option_label: 'Empate',
          option_value: 'draw',
          multiplier: calculateMultiplier(pctDraw),
        },
        {
          fixture_id: fixtureId,
          bet_type_id: matchResultType.id,
          option_label: 'Visitante',
          option_value: 'away',
          multiplier: calculateMultiplier(pctAway),
        }
      );
    }

    // Over/Under 2.5 options
    if (overUnderType) {
      const underProb = await this.calculateOverUnderProbability(fixtureId);
      const overProb = 1 - underProb;

      options.push(
        {
          fixture_id: fixtureId,
          bet_type_id: overUnderType.id,
          option_label: 'Mas de 2.5 goles',
          option_value: 'over_2_5',
          multiplier: calculateMultiplier(overProb),
        },
        {
          fixture_id: fixtureId,
          bet_type_id: overUnderType.id,
          option_label: 'Menos de 2.5 goles',
          option_value: 'under_2_5',
          multiplier: calculateMultiplier(underProb),
        }
      );
    }

    // Delete existing options and insert new ones
    await supabase.from('bet_options').delete().eq('fixture_id', fixtureId);
    const { error } = await supabase.from('bet_options').insert(options);

    if (error) {
      logger.error(`Failed to insert bet options for fixture ${fixtureId}:`, error);
      throw error;
    }

    logger.info(`Generated ${options.length} bet options for fixture ${fixtureId}`);
  }

  /**
   * Calculate P(Under 2.5) using Poisson distribution based on team aggregate stats
   */
  private async calculateOverUnderProbability(fixtureId: string): Promise<number> {
    const { data: fixture } = await supabase
      .from('fixtures')
      .select('home_team_id, away_team_id')
      .eq('id', fixtureId)
      .single();

    if (!fixture) return 0.5;

    const { data: homeStats } = await supabase
      .from('team_aggregate_stats')
      .select('avg_goals_scored, avg_goals_conceded')
      .eq('team_id', fixture.home_team_id)
      .single();

    const { data: awayStats } = await supabase
      .from('team_aggregate_stats')
      .select('avg_goals_scored, avg_goals_conceded')
      .eq('team_id', fixture.away_team_id)
      .single();

    // If no stats available, use league average (~2.5 goals/game)
    const leagueAvgScored = 1.25;

    const lambdaHome = homeStats
      ? (homeStats.avg_goals_scored + awayStats?.avg_goals_conceded!) / 2
      : leagueAvgScored;
    const lambdaAway = awayStats
      ? (awayStats.avg_goals_scored + homeStats?.avg_goals_conceded!) / 2
      : leagueAvgScored;

    return poissonUnderProbability(lambdaHome, lambdaAway, 2);
  }
}

export const oddsService = new OddsService();
