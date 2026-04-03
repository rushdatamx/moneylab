-- MoneyLab: Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixture_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixture_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_aggregate_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE bet_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_match_credits ENABLE ROW LEVEL SECURITY;

----------------------------------------------
-- PROFILES
----------------------------------------------
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

----------------------------------------------
-- LEAGUES
----------------------------------------------
CREATE POLICY "Leagues viewable by members"
  ON leagues FOR SELECT USING (
    id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create leagues"
  ON leagues FOR INSERT WITH CHECK (auth.uid() = created_by);

----------------------------------------------
-- LEAGUE_MEMBERS
----------------------------------------------
CREATE POLICY "League members viewable by co-members"
  ON league_members FOR SELECT USING (
    league_id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join leagues"
  ON league_members FOR INSERT WITH CHECK (auth.uid() = user_id);

----------------------------------------------
-- PUBLIC DATA: Teams, Players, Fixtures, Stats, Events, Predictions, Bet Types, Bet Options
----------------------------------------------
CREATE POLICY "Teams are public" ON teams FOR SELECT USING (true);
CREATE POLICY "Players are public" ON players FOR SELECT USING (true);
CREATE POLICY "Fixtures are public" ON fixtures FOR SELECT USING (true);
CREATE POLICY "Fixture statistics are public" ON fixture_statistics FOR SELECT USING (true);
CREATE POLICY "Fixture events are public" ON fixture_events FOR SELECT USING (true);
CREATE POLICY "Team aggregate stats are public" ON team_aggregate_stats FOR SELECT USING (true);
CREATE POLICY "Predictions are public" ON predictions_cache FOR SELECT USING (true);
CREATE POLICY "Bet types are public" ON bet_types FOR SELECT USING (true);
CREATE POLICY "Bet options are public" ON bet_options FOR SELECT USING (true);

----------------------------------------------
-- BETS - Visibility rules
----------------------------------------------
-- Before kickoff: only see your own bets
-- After kickoff: see all bets in your leagues
CREATE POLICY "Users can see own bets"
  ON bets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "See league bets after kickoff"
  ON bets FOR SELECT USING (
    league_id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid())
    AND fixture_id IN (SELECT id FROM fixtures WHERE is_bets_locked = true)
  );

CREATE POLICY "Users can place bets"
  ON bets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own pending bets"
  ON bets FOR DELETE USING (
    auth.uid() = user_id
    AND status = 'pending'
    AND fixture_id IN (SELECT id FROM fixtures WHERE is_bets_locked = false)
  );

----------------------------------------------
-- USER_MATCH_CREDITS
----------------------------------------------
CREATE POLICY "Users can see own credits"
  ON user_match_credits FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits"
  ON user_match_credits FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON user_match_credits FOR UPDATE USING (auth.uid() = user_id);

----------------------------------------------
-- SERVICE ROLE: Allow backend (service_role) full access for syncs
----------------------------------------------
-- The service_role key bypasses RLS by default in Supabase,
-- so no additional policies needed for backend operations.
