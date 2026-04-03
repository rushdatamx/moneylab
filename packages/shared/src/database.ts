import type { FixtureStatus, BetStatus, BetTypeSlug, PlayerPosition } from './enums';

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface League {
  id: string;
  name: string;
  invitation_code: string;
  credits_per_match: number;
  created_by: string;
  created_at: string;
}

export interface LeagueMember {
  id: string;
  league_id: string;
  user_id: string;
  total_points: number;
  joined_at: string;
}

export interface Team {
  id: string;
  api_football_id: number;
  name: string;
  code: string | null;
  logo: string | null;
  group_name: string | null;
  group_rank: number | null;
  created_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  api_football_id: number;
  name: string;
  position: PlayerPosition | null;
  number: number | null;
  photo: string | null;
}

export interface Fixture {
  id: string;
  api_football_id: number;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  kickoff_at: string;
  round: string | null;
  venue: string | null;
  status: FixtureStatus;
  is_bets_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface FixtureStatistic {
  id: string;
  fixture_id: string;
  team_id: string;
  shots_on_goal: number | null;
  shots_total: number | null;
  possession_pct: number | null;
  passes_total: number | null;
  passes_accurate: number | null;
  fouls: number | null;
  corners: number | null;
  offsides: number | null;
  yellow_cards: number | null;
  red_cards: number | null;
  saves: number | null;
}

export interface FixtureEvent {
  id: string;
  fixture_id: string;
  team_id: string;
  player_name: string | null;
  assist_name: string | null;
  event_type: string;
  detail: string | null;
  minute: number;
  extra_minute: number | null;
}

export interface TeamAggregateStats {
  id: string;
  team_id: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_scored: number;
  goals_conceded: number;
  avg_goals_scored: number;
  avg_goals_conceded: number;
  avg_possession: number;
  form: string | null;
  updated_at: string;
}

export interface PredictionsCache {
  id: string;
  fixture_id: string;
  pct_home: number;
  pct_draw: number;
  pct_away: number;
  advice: string | null;
  comparison: Record<string, unknown> | null;
  fetched_at: string;
}

export interface BetType {
  id: string;
  slug: BetTypeSlug;
  label: string;
  description: string | null;
}

export interface BetOption {
  id: string;
  fixture_id: string;
  bet_type_id: string;
  option_label: string;
  option_value: string;
  multiplier: number;
  created_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  league_id: string;
  bet_option_id: string;
  fixture_id: string;
  credits_wagered: number;
  multiplier_at_placement: number;
  status: BetStatus;
  credits_won: number | null;
  placed_at: string;
  resolved_at: string | null;
}

export interface UserMatchCredits {
  id: string;
  user_id: string;
  league_id: string;
  fixture_id: string;
  credits_used: number;
}
