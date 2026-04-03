-- MoneyLab: FIFA World Cup 2026 - Database Schema
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

----------------------------------------------
-- 1. PROFILES (extends auth.users)
----------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_username ON profiles(username);

----------------------------------------------
-- 2. LEAGUES
----------------------------------------------
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  invitation_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(4), 'hex'),
  credits_per_match INT NOT NULL DEFAULT 100,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leagues_invitation_code ON leagues(invitation_code);

----------------------------------------------
-- 3. LEAGUE_MEMBERS
----------------------------------------------
CREATE TABLE league_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_points INT NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(league_id, user_id)
);

CREATE INDEX idx_league_members_league ON league_members(league_id);
CREATE INDEX idx_league_members_user ON league_members(user_id);

----------------------------------------------
-- 4. TEAMS
----------------------------------------------
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_football_id INT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  logo TEXT,
  group_name TEXT,
  group_rank INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_teams_api_id ON teams(api_football_id);

----------------------------------------------
-- 5. PLAYERS
----------------------------------------------
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  api_football_id INT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  position TEXT,
  number INT,
  photo TEXT
);

CREATE INDEX idx_players_team ON players(team_id);

----------------------------------------------
-- 6. FIXTURES
----------------------------------------------
CREATE TABLE fixtures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_football_id INT UNIQUE NOT NULL,
  home_team_id UUID NOT NULL REFERENCES teams(id),
  away_team_id UUID NOT NULL REFERENCES teams(id),
  home_score INT,
  away_score INT,
  kickoff_at TIMESTAMPTZ NOT NULL,
  round TEXT,
  venue TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  is_bets_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fixtures_kickoff ON fixtures(kickoff_at);
CREATE INDEX idx_fixtures_status ON fixtures(status);
CREATE INDEX idx_fixtures_api_id ON fixtures(api_football_id);

----------------------------------------------
-- 7. FIXTURE_STATISTICS
----------------------------------------------
CREATE TABLE fixture_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id),
  shots_on_goal INT,
  shots_total INT,
  possession_pct NUMERIC(5,2),
  passes_total INT,
  passes_accurate INT,
  fouls INT,
  corners INT,
  offsides INT,
  yellow_cards INT,
  red_cards INT,
  saves INT,
  UNIQUE(fixture_id, team_id)
);

CREATE INDEX idx_fixture_stats_fixture ON fixture_statistics(fixture_id);

----------------------------------------------
-- 8. FIXTURE_EVENTS
----------------------------------------------
CREATE TABLE fixture_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id),
  player_name TEXT,
  assist_name TEXT,
  event_type TEXT NOT NULL,
  detail TEXT,
  minute INT NOT NULL,
  extra_minute INT
);

CREATE INDEX idx_fixture_events_fixture ON fixture_events(fixture_id);

----------------------------------------------
-- 9. TEAM_AGGREGATE_STATS
----------------------------------------------
CREATE TABLE team_aggregate_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID UNIQUE NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  matches_played INT NOT NULL DEFAULT 0,
  wins INT NOT NULL DEFAULT 0,
  draws INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  goals_scored INT NOT NULL DEFAULT 0,
  goals_conceded INT NOT NULL DEFAULT 0,
  avg_goals_scored NUMERIC(4,2) NOT NULL DEFAULT 0,
  avg_goals_conceded NUMERIC(4,2) NOT NULL DEFAULT 0,
  avg_possession NUMERIC(5,2) NOT NULL DEFAULT 0,
  form TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

----------------------------------------------
-- 10. PREDICTIONS_CACHE
----------------------------------------------
CREATE TABLE predictions_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id UUID UNIQUE NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  pct_home NUMERIC(5,2) NOT NULL,
  pct_draw NUMERIC(5,2) NOT NULL,
  pct_away NUMERIC(5,2) NOT NULL,
  advice TEXT,
  comparison JSONB,
  fetched_at TIMESTAMPTZ DEFAULT now()
);

----------------------------------------------
-- 11. BET_TYPES
----------------------------------------------
CREATE TABLE bet_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT
);

----------------------------------------------
-- 12. BET_OPTIONS
----------------------------------------------
CREATE TABLE bet_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  bet_type_id UUID NOT NULL REFERENCES bet_types(id),
  option_label TEXT NOT NULL,
  option_value TEXT NOT NULL,
  multiplier NUMERIC(6,2) NOT NULL DEFAULT 1.05,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bet_options_fixture ON bet_options(fixture_id);

----------------------------------------------
-- 13. BETS
----------------------------------------------
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  league_id UUID NOT NULL REFERENCES leagues(id),
  bet_option_id UUID NOT NULL REFERENCES bet_options(id),
  fixture_id UUID NOT NULL REFERENCES fixtures(id),
  credits_wagered INT NOT NULL CHECK (credits_wagered > 0),
  multiplier_at_placement NUMERIC(6,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  credits_won INT,
  placed_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_bets_user ON bets(user_id);
CREATE INDEX idx_bets_fixture ON bets(fixture_id);
CREATE INDEX idx_bets_league ON bets(league_id);
CREATE INDEX idx_bets_status ON bets(status);

----------------------------------------------
-- 14. USER_MATCH_CREDITS
----------------------------------------------
CREATE TABLE user_match_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  league_id UUID NOT NULL REFERENCES leagues(id),
  fixture_id UUID NOT NULL REFERENCES fixtures(id),
  credits_used INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, league_id, fixture_id)
);
