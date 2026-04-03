import { supabase } from '../config/supabase';
import { apiFootballService } from './api-football.service';
import { NotFoundError } from '../utils/errors';
import type { FixtureWithTeams, FixtureDetail, FixtureFilters, H2HResponse } from '@moneylab/shared';

class FixtureService {
  async getFixtures(filters: FixtureFilters = {}): Promise<FixtureWithTeams[]> {
    let query = supabase
      .from('fixtures')
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*)
      `)
      .order('kickoff_at', { ascending: true });

    if (filters.date) {
      query = query
        .gte('kickoff_at', `${filters.date}T00:00:00`)
        .lt('kickoff_at', `${filters.date}T23:59:59`);
    }
    if (filters.round) {
      query = query.eq('round', filters.round);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.team_id) {
      query = query.or(`home_team_id.eq.${filters.team_id},away_team_id.eq.${filters.team_id}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as FixtureWithTeams[];
  }

  async getUpcoming(limit: number = 5): Promise<FixtureWithTeams[]> {
    const { data, error } = await supabase
      .from('fixtures')
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*)
      `)
      .eq('status', 'scheduled')
      .gte('kickoff_at', new Date().toISOString())
      .order('kickoff_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as FixtureWithTeams[];
  }

  async getLive(): Promise<FixtureWithTeams[]> {
    const { data, error } = await supabase
      .from('fixtures')
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*)
      `)
      .in('status', ['live', 'halftime'])
      .order('kickoff_at', { ascending: true });

    if (error) throw error;
    return data as FixtureWithTeams[];
  }

  async getById(id: string): Promise<FixtureDetail> {
    const { data: fixture, error } = await supabase
      .from('fixtures')
      .select(`
        *,
        home_team:teams!fixtures_home_team_id_fkey(*),
        away_team:teams!fixtures_away_team_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error || !fixture) throw new NotFoundError('Partido');

    const [statsResult, eventsResult, predictionsResult] = await Promise.all([
      supabase.from('fixture_statistics').select('*').eq('fixture_id', id),
      supabase.from('fixture_events').select('*').eq('fixture_id', id).order('minute'),
      supabase.from('predictions_cache').select('*').eq('fixture_id', id).single(),
    ]);

    return {
      ...fixture,
      statistics: statsResult.data || [],
      events: eventsResult.data || [],
      predictions: predictionsResult.data || null,
    } as FixtureDetail;
  }

  async getStatistics(fixtureId: string) {
    const { data, error } = await supabase
      .from('fixture_statistics')
      .select(`*, team:teams(name, logo)`)
      .eq('fixture_id', fixtureId);

    if (error) throw error;
    return data;
  }

  async getH2H(fixtureId: string): Promise<H2HResponse> {
    const { data: fixture } = await supabase
      .from('fixtures')
      .select('home_team_id, away_team_id')
      .eq('id', fixtureId)
      .single();

    if (!fixture) throw new NotFoundError('Partido');

    const { data: homeTeam } = await supabase
      .from('teams')
      .select('api_football_id')
      .eq('id', fixture.home_team_id)
      .single();

    const { data: awayTeam } = await supabase
      .from('teams')
      .select('api_football_id')
      .eq('id', fixture.away_team_id)
      .single();

    if (!homeTeam || !awayTeam) throw new NotFoundError('Equipo');

    // Try to get from API-Football
    const afFixtures = await apiFootballService.getHeadToHead(
      homeTeam.api_football_id,
      awayTeam.api_football_id
    );

    const h2hFixtures: FixtureWithTeams[] = afFixtures.map(af => ({
      id: '',
      api_football_id: af.fixture.id,
      home_team_id: '',
      away_team_id: '',
      home_score: af.goals.home,
      away_score: af.goals.away,
      kickoff_at: af.fixture.date,
      round: af.league.round,
      venue: af.fixture.venue?.name || null,
      status: 'finished' as const,
      is_bets_locked: true,
      created_at: '',
      updated_at: '',
      home_team: {
        id: '', api_football_id: af.teams.home.id, name: af.teams.home.name,
        code: null, logo: af.teams.home.logo, group_name: null, group_rank: null, created_at: '',
      },
      away_team: {
        id: '', api_football_id: af.teams.away.id, name: af.teams.away.name,
        code: null, logo: af.teams.away.logo, group_name: null, group_rank: null, created_at: '',
      },
    }));

    const summary = { home_wins: 0, away_wins: 0, draws: 0, total: afFixtures.length };
    for (const af of afFixtures) {
      if (af.goals.home !== null && af.goals.away !== null) {
        if (af.goals.home > af.goals.away) summary.home_wins++;
        else if (af.goals.home < af.goals.away) summary.away_wins++;
        else summary.draws++;
      }
    }

    return { fixtures: h2hFixtures, summary };
  }

  async getPredictions(fixtureId: string) {
    const { data, error } = await supabase
      .from('predictions_cache')
      .select('*')
      .eq('fixture_id', fixtureId)
      .single();

    if (error) throw new NotFoundError('Prediccion');
    return data;
  }

  async getBetOptions(fixtureId: string) {
    const { data, error } = await supabase
      .from('bet_options')
      .select(`*, bet_type:bet_types(*)`)
      .eq('fixture_id', fixtureId);

    if (error) throw error;

    const matchResult = data?.filter(o => o.bet_type?.slug === 'match_result') || [];
    const overUnder = data?.filter(o => o.bet_type?.slug === 'over_under') || [];

    return { fixture_id: fixtureId, match_result: matchResult, over_under: overUnder };
  }
}

export const fixtureService = new FixtureService();
