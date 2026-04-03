import type { Profile, League, LeagueMember, Team, Fixture, FixtureStatistic, FixtureEvent, PredictionsCache, BetOption, Bet, BetType } from './database';

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Auth
export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Profile;
  access_token: string;
  refresh_token: string;
}

// Profile
export interface UpdateProfileRequest {
  display_name?: string;
  avatar_url?: string;
}

// Leagues
export interface CreateLeagueRequest {
  name: string;
  credits_per_match?: number;
}

export interface JoinLeagueRequest {
  invitation_code: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  bets_won: number;
  bets_lost: number;
  bets_total: number;
}

// Fixtures
export interface FixtureWithTeams extends Fixture {
  home_team: Team;
  away_team: Team;
}

export interface FixtureDetail extends FixtureWithTeams {
  statistics: FixtureStatistic[];
  events: FixtureEvent[];
  predictions: PredictionsCache | null;
}

export interface FixtureFilters {
  date?: string;
  round?: string;
  status?: string;
  team_id?: string;
}

// H2H
export interface H2HResponse {
  fixtures: FixtureWithTeams[];
  summary: {
    home_wins: number;
    away_wins: number;
    draws: number;
    total: number;
  };
}

// Bets
export interface PlaceBetRequest {
  league_id: string;
  fixture_id: string;
  bet_option_id: string;
  credits_wagered: number;
}

export interface BetWithDetails extends Bet {
  bet_option: BetOption & {
    bet_type: BetType;
  };
  fixture: FixtureWithTeams;
}

export interface FixtureBetOptions {
  fixture_id: string;
  match_result: BetOption[];
  over_under: BetOption[];
}
