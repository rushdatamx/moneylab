import { supabase } from '../config/supabase';
import { apiFootballService } from './api-football.service';
import { oddsService } from './odds.service';
import { mapFixtureStatus } from '../types/api-football.types';
import { logger } from '../utils/logger';

class SyncService {
  /**
   * Sync all World Cup teams from API-Football
   */
  async syncTeams(): Promise<number> {
    const afTeams = await apiFootballService.getTeams();
    let synced = 0;

    for (const item of afTeams) {
      const { error } = await supabase.from('teams').upsert(
        {
          api_football_id: item.team.id,
          name: item.team.name,
          code: item.team.code,
          logo: item.team.logo,
        },
        { onConflict: 'api_football_id' }
      );

      if (!error) synced++;
      else logger.error(`Failed to sync team ${item.team.name}:`, error);
    }

    logger.info(`Synced ${synced}/${afTeams.length} teams`);
    return synced;
  }

  /**
   * Sync squad/players for a team
   */
  async syncSquad(teamApiId: number): Promise<void> {
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('api_football_id', teamApiId)
      .single();

    if (!team) {
      logger.warn(`Team with api_football_id ${teamApiId} not found`);
      return;
    }

    const squads = await apiFootballService.getSquad(teamApiId);
    if (!squads.length) return;

    const players = squads[0].players.map(p => ({
      team_id: team.id,
      api_football_id: p.player.id,
      name: p.player.name,
      position: p.player.position,
      number: p.player.number,
      photo: p.player.photo,
    }));

    const { error } = await supabase
      .from('players')
      .upsert(players, { onConflict: 'api_football_id' });

    if (error) logger.error(`Failed to sync squad for team ${teamApiId}:`, error);
    else logger.info(`Synced ${players.length} players for team ${teamApiId}`);
  }

  /**
   * Sync all fixtures from API-Football
   */
  async syncFixtures(): Promise<number> {
    const afFixtures = await apiFootballService.getFixtures();
    let synced = 0;

    for (const af of afFixtures) {
      // Lookup team IDs
      const { data: homeTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('api_football_id', af.teams.home.id)
        .single();

      const { data: awayTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('api_football_id', af.teams.away.id)
        .single();

      if (!homeTeam || !awayTeam) {
        logger.warn(`Teams not found for fixture ${af.fixture.id}, skipping`);
        continue;
      }

      const status = mapFixtureStatus(af.fixture.status.short);

      const { error } = await supabase.from('fixtures').upsert(
        {
          api_football_id: af.fixture.id,
          home_team_id: homeTeam.id,
          away_team_id: awayTeam.id,
          home_score: af.goals.home,
          away_score: af.goals.away,
          kickoff_at: af.fixture.date,
          round: af.league.round,
          venue: af.fixture.venue?.name || null,
          status,
        },
        { onConflict: 'api_football_id' }
      );

      if (!error) synced++;
      else logger.error(`Failed to sync fixture ${af.fixture.id}:`, error);
    }

    logger.info(`Synced ${synced}/${afFixtures.length} fixtures`);
    return synced;
  }

  /**
   * Sync predictions for upcoming fixtures
   */
  async syncPredictions(): Promise<number> {
    const { data: upcomingFixtures } = await supabase
      .from('fixtures')
      .select('id, api_football_id')
      .eq('status', 'scheduled')
      .order('kickoff_at', { ascending: true })
      .limit(20);

    if (!upcomingFixtures?.length) return 0;
    let synced = 0;

    for (const fixture of upcomingFixtures) {
      try {
        const predictions = await apiFootballService.getPredictions(fixture.api_football_id);
        if (!predictions.length) continue;

        const pred = predictions[0];
        const pctHome = parseFloat(pred.predictions.percent.home.replace('%', ''));
        const pctDraw = parseFloat(pred.predictions.percent.draw.replace('%', ''));
        const pctAway = parseFloat(pred.predictions.percent.away.replace('%', ''));

        const { error } = await supabase.from('predictions_cache').upsert(
          {
            fixture_id: fixture.id,
            pct_home: pctHome,
            pct_draw: pctDraw,
            pct_away: pctAway,
            advice: pred.predictions.advice,
            comparison: pred.comparison,
          },
          { onConflict: 'fixture_id' }
        );

        if (!error) synced++;
      } catch (err) {
        logger.error(`Failed to sync prediction for fixture ${fixture.api_football_id}:`, err);
      }
    }

    logger.info(`Synced predictions for ${synced} fixtures`);
    return synced;
  }

  /**
   * Generate bet options for fixtures with predictions but no options yet
   */
  async generateBetOptionsForUpcoming(): Promise<number> {
    const { data: fixtures } = await supabase
      .from('predictions_cache')
      .select('fixture_id')
      .not('fixture_id', 'in', `(SELECT DISTINCT fixture_id FROM bet_options)`);

    // Fallback: get fixtures with predictions
    const { data: predictedFixtures } = await supabase
      .from('predictions_cache')
      .select('fixture_id');

    if (!predictedFixtures?.length) return 0;

    let generated = 0;
    for (const pf of predictedFixtures) {
      // Check if options exist
      const { count } = await supabase
        .from('bet_options')
        .select('*', { count: 'exact', head: true })
        .eq('fixture_id', pf.fixture_id);

      if (count && count > 0) continue;

      try {
        await oddsService.generateBetOptions(pf.fixture_id);
        generated++;
      } catch (err) {
        logger.error(`Failed to generate bet options for ${pf.fixture_id}:`, err);
      }
    }

    return generated;
  }

  /**
   * Sync live fixture data (score, events, statistics)
   */
  async syncLiveData(): Promise<void> {
    const liveFixtures = await apiFootballService.getLiveFixtures();
    if (!liveFixtures.length) {
      logger.debug('No live fixtures');
      return;
    }

    for (const af of liveFixtures) {
      const { data: fixture } = await supabase
        .from('fixtures')
        .select('id')
        .eq('api_football_id', af.fixture.id)
        .single();

      if (!fixture) continue;

      // Update score and status
      await supabase.from('fixtures').update({
        home_score: af.goals.home,
        away_score: af.goals.away,
        status: mapFixtureStatus(af.fixture.status.short),
      }).eq('id', fixture.id);

      // Sync statistics
      await this.syncFixtureStats(fixture.id, af.fixture.id);

      // Sync events
      await this.syncFixtureEvents(fixture.id, af.fixture.id);
    }

    logger.info(`Updated ${liveFixtures.length} live fixtures`);
  }

  /**
   * Sync statistics for a specific fixture
   */
  async syncFixtureStats(fixtureId: string, apiFixtureId: number): Promise<void> {
    const stats = await apiFootballService.getFixtureStatistics(apiFixtureId);

    for (const teamStats of stats) {
      const { data: team } = await supabase
        .from('teams')
        .select('id')
        .eq('api_football_id', teamStats.team.id)
        .single();

      if (!team) continue;

      const getValue = (type: string): number | null => {
        const stat = teamStats.statistics.find(s => s.type === type);
        if (!stat || stat.value === null) return null;
        const val = String(stat.value).replace('%', '');
        return parseFloat(val) || 0;
      };

      await supabase.from('fixture_statistics').upsert(
        {
          fixture_id: fixtureId,
          team_id: team.id,
          shots_on_goal: getValue('Shots on Goal'),
          shots_total: getValue('Total Shots'),
          possession_pct: getValue('Ball Possession'),
          passes_total: getValue('Total passes'),
          passes_accurate: getValue('Passes accurate'),
          fouls: getValue('Fouls'),
          corners: getValue('Corner Kicks'),
          offsides: getValue('Offsides'),
          yellow_cards: getValue('Yellow Cards'),
          red_cards: getValue('Red Cards'),
          saves: getValue('Goalkeeper Saves'),
        },
        { onConflict: 'fixture_id,team_id' }
      );
    }
  }

  /**
   * Sync events for a specific fixture
   */
  async syncFixtureEvents(fixtureId: string, apiFixtureId: number): Promise<void> {
    const events = await apiFootballService.getFixtureEvents(apiFixtureId);

    // Delete existing events and re-insert (events can be corrected)
    await supabase.from('fixture_events').delete().eq('fixture_id', fixtureId);

    for (const event of events) {
      const { data: team } = await supabase
        .from('teams')
        .select('id')
        .eq('api_football_id', event.team.id)
        .single();

      if (!team) continue;

      await supabase.from('fixture_events').insert({
        fixture_id: fixtureId,
        team_id: team.id,
        player_name: event.player.name,
        assist_name: event.assist.name,
        event_type: event.type,
        detail: event.detail,
        minute: event.time.elapsed,
        extra_minute: event.time.extra,
      });
    }
  }
}

export const syncService = new SyncService();
