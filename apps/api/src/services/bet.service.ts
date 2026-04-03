import { supabase } from '../config/supabase';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';
import type { PlaceBetRequest, BetWithDetails } from '@moneylab/shared';

class BetService {
  async placeBet(userId: string, req: PlaceBetRequest): Promise<any> {
    const { league_id, fixture_id, bet_option_id, credits_wagered } = req;

    // Verify user is in league
    const { data: member } = await supabase
      .from('league_members')
      .select('id')
      .eq('league_id', league_id)
      .eq('user_id', userId)
      .single();

    if (!member) throw new ForbiddenError('No eres miembro de esta liga');

    // Verify fixture exists and is not locked
    const { data: fixture } = await supabase
      .from('fixtures')
      .select('id, is_bets_locked, status')
      .eq('id', fixture_id)
      .single();

    if (!fixture) throw new NotFoundError('Partido');
    if (fixture.is_bets_locked || fixture.status !== 'scheduled') {
      throw new BadRequestError('Las apuestas para este partido estan cerradas');
    }

    // Get bet option with multiplier
    const { data: betOption } = await supabase
      .from('bet_options')
      .select('id, multiplier')
      .eq('id', bet_option_id)
      .eq('fixture_id', fixture_id)
      .single();

    if (!betOption) throw new NotFoundError('Opcion de apuesta');

    // Insert bet (trigger validates credits)
    const { data: bet, error } = await supabase
      .from('bets')
      .insert({
        user_id: userId,
        league_id,
        fixture_id,
        bet_option_id,
        credits_wagered,
        multiplier_at_placement: betOption.multiplier,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      // Trigger validation errors come back as PostgrestError
      if (error.message.includes('creditos')) {
        throw new BadRequestError(error.message);
      }
      throw error;
    }

    return bet;
  }

  async getMyBets(userId: string): Promise<BetWithDetails[]> {
    const { data, error } = await supabase
      .from('bets')
      .select(`
        *,
        bet_option:bet_options(*, bet_type:bet_types(*)),
        fixture:fixtures(
          *,
          home_team:teams!fixtures_home_team_id_fkey(*),
          away_team:teams!fixtures_away_team_id_fkey(*)
        )
      `)
      .eq('user_id', userId)
      .order('placed_at', { ascending: false });

    if (error) throw error;
    return data as BetWithDetails[];
  }

  async cancelBet(userId: string, betId: string): Promise<void> {
    const { data: bet } = await supabase
      .from('bets')
      .select('id, user_id, fixture_id, status')
      .eq('id', betId)
      .single();

    if (!bet) throw new NotFoundError('Apuesta');
    if (bet.user_id !== userId) throw new ForbiddenError();
    if (bet.status !== 'pending') throw new BadRequestError('Solo puedes cancelar apuestas pendientes');

    // Verify fixture not locked
    const { data: fixture } = await supabase
      .from('fixtures')
      .select('is_bets_locked')
      .eq('id', bet.fixture_id)
      .single();

    if (fixture?.is_bets_locked) {
      throw new BadRequestError('Las apuestas para este partido ya estan cerradas');
    }

    const { error } = await supabase.from('bets').delete().eq('id', betId);
    if (error) throw error;
  }

  async getFixtureLeagueBets(fixtureId: string, leagueId: string, userId: string) {
    // Verify user is in league
    const { data: member } = await supabase
      .from('league_members')
      .select('id')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .single();

    if (!member) throw new ForbiddenError('No eres miembro de esta liga');

    // Verify fixture is locked (bets visible after kickoff)
    const { data: fixture } = await supabase
      .from('fixtures')
      .select('is_bets_locked')
      .eq('id', fixtureId)
      .single();

    if (!fixture) throw new NotFoundError('Partido');
    if (!fixture.is_bets_locked) {
      throw new BadRequestError('Las apuestas son visibles despues del silbatazo');
    }

    const { data, error } = await supabase
      .from('bets')
      .select(`
        *,
        profile:profiles!bets_user_id_fkey(username, display_name, avatar_url),
        bet_option:bet_options(option_label, option_value, multiplier, bet_type:bet_types(label))
      `)
      .eq('fixture_id', fixtureId)
      .eq('league_id', leagueId);

    if (error) throw error;
    return data;
  }

  /**
   * Resolve bets for finished fixtures
   */
  async resolveBets(): Promise<number> {
    // Get finished fixtures with pending bets
    const { data: fixtures } = await supabase
      .from('fixtures')
      .select('id, home_score, away_score')
      .eq('status', 'finished')
      .not('home_score', 'is', null)
      .not('away_score', 'is', null);

    if (!fixtures?.length) return 0;

    let resolved = 0;

    for (const fixture of fixtures) {
      const { data: pendingBets } = await supabase
        .from('bets')
        .select(`
          id, user_id, league_id, credits_wagered, multiplier_at_placement,
          bet_option:bet_options(option_value, bet_type:bet_types(slug))
        `)
        .eq('fixture_id', fixture.id)
        .eq('status', 'pending');

      if (!pendingBets?.length) continue;

      const homeScore = fixture.home_score!;
      const awayScore = fixture.away_score!;
      const totalGoals = homeScore + awayScore;

      for (const bet of pendingBets) {
        const option = bet.bet_option as any;
        const slug = option?.bet_type?.slug;
        const value = option?.option_value;
        let won = false;

        if (slug === 'match_result') {
          if (value === 'home' && homeScore > awayScore) won = true;
          else if (value === 'draw' && homeScore === awayScore) won = true;
          else if (value === 'away' && homeScore < awayScore) won = true;
        } else if (slug === 'over_under') {
          if (value === 'over_2_5' && totalGoals > 2.5) won = true;
          else if (value === 'under_2_5' && totalGoals < 2.5) won = true;
        }

        const creditsWon = won
          ? Math.round(bet.credits_wagered * bet.multiplier_at_placement)
          : 0;

        await supabase
          .from('bets')
          .update({
            status: won ? 'won' : 'lost',
            credits_won: creditsWon,
            resolved_at: new Date().toISOString(),
          })
          .eq('id', bet.id);

        // If won, add points to leaderboard
        if (won) {
          await supabase.rpc('', {}); // We'll handle this inline
          const { data: member } = await supabase
            .from('league_members')
            .select('total_points')
            .eq('league_id', bet.league_id)
            .eq('user_id', bet.user_id)
            .single();

          if (member) {
            await supabase
              .from('league_members')
              .update({ total_points: member.total_points + creditsWon })
              .eq('league_id', bet.league_id)
              .eq('user_id', bet.user_id);
          }
        }

        resolved++;
      }
    }

    if (resolved > 0) logger.info(`Resolved ${resolved} bets`);
    return resolved;
  }
}

export const betService = new BetService();
