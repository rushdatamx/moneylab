import { apiFootball, WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON } from '../config/api-football';
import { logger } from '../utils/logger';
import type {
  ApiFootballResponse,
  AFTeam,
  AFFixture,
  AFFixtureStatistic,
  AFFixtureEvent,
  AFPrediction,
  AFSquad,
} from '../types/api-football.types';

class ApiFootballService {
  private async get<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T[]> {
    try {
      const { data } = await apiFootball.get<ApiFootballResponse<T>>(endpoint, { params });
      if (data.errors && Object.keys(data.errors).length > 0) {
        logger.error('API-Football errors:', data.errors);
        throw new Error(`API-Football error: ${JSON.stringify(data.errors)}`);
      }
      return data.response;
    } catch (error) {
      logger.error(`API-Football request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async getTeams(): Promise<AFTeam[]> {
    return this.get<AFTeam>('/teams', {
      league: WORLD_CUP_LEAGUE_ID,
      season: WORLD_CUP_SEASON,
    });
  }

  async getSquad(teamId: number): Promise<AFSquad[]> {
    return this.get<AFSquad>('/players/squads', { team: teamId });
  }

  async getFixtures(): Promise<AFFixture[]> {
    return this.get<AFFixture>('/fixtures', {
      league: WORLD_CUP_LEAGUE_ID,
      season: WORLD_CUP_SEASON,
    });
  }

  async getLiveFixtures(): Promise<AFFixture[]> {
    return this.get<AFFixture>('/fixtures', {
      live: 'all',
      league: WORLD_CUP_LEAGUE_ID,
    });
  }

  async getFixtureStatistics(fixtureId: number): Promise<AFFixtureStatistic[]> {
    return this.get<AFFixtureStatistic>('/fixtures/statistics', {
      fixture: fixtureId,
    });
  }

  async getFixtureEvents(fixtureId: number): Promise<AFFixtureEvent[]> {
    return this.get<AFFixtureEvent>('/fixtures/events', {
      fixture: fixtureId,
    });
  }

  async getHeadToHead(teamId1: number, teamId2: number, last: number = 10): Promise<AFFixture[]> {
    return this.get<AFFixture>('/fixtures/headtohead', {
      h2h: `${teamId1}-${teamId2}`,
      last,
    });
  }

  async getPredictions(fixtureId: number): Promise<AFPrediction[]> {
    return this.get<AFPrediction>('/predictions', {
      fixture: fixtureId,
    });
  }
}

export const apiFootballService = new ApiFootballService();
