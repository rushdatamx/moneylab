-- MoneyLab: Functions and Triggers

----------------------------------------------
-- Auto-create profile on signup
----------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

----------------------------------------------
-- Validate bet credits before insert
----------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_bet_credits()
RETURNS TRIGGER AS $$
DECLARE
  v_credits_per_match INT;
  v_credits_used INT;
  v_is_locked BOOLEAN;
BEGIN
  -- Check if bets are locked
  SELECT is_bets_locked INTO v_is_locked
  FROM fixtures WHERE id = NEW.fixture_id;

  IF v_is_locked THEN
    RAISE EXCEPTION 'Las apuestas para este partido estan cerradas';
  END IF;

  -- Get credits per match for this league
  SELECT credits_per_match INTO v_credits_per_match
  FROM leagues WHERE id = NEW.league_id;

  -- Get current credits used
  SELECT COALESCE(credits_used, 0) INTO v_credits_used
  FROM user_match_credits
  WHERE user_id = NEW.user_id
    AND league_id = NEW.league_id
    AND fixture_id = NEW.fixture_id;

  -- Validate enough credits
  IF (v_credits_used + NEW.credits_wagered) > v_credits_per_match THEN
    RAISE EXCEPTION 'No tienes suficientes creditos. Disponibles: %, Intentas apostar: %',
      v_credits_per_match - v_credits_used, NEW.credits_wagered;
  END IF;

  -- Upsert user_match_credits
  INSERT INTO user_match_credits (user_id, league_id, fixture_id, credits_used)
  VALUES (NEW.user_id, NEW.league_id, NEW.fixture_id, NEW.credits_wagered)
  ON CONFLICT (user_id, league_id, fixture_id)
  DO UPDATE SET credits_used = user_match_credits.credits_used + NEW.credits_wagered;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_bet_before_insert
  BEFORE INSERT ON bets
  FOR EACH ROW EXECUTE FUNCTION public.validate_bet_credits();

----------------------------------------------
-- Restore credits on bet cancellation
----------------------------------------------
CREATE OR REPLACE FUNCTION public.restore_bet_credits()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_match_credits
  SET credits_used = credits_used - OLD.credits_wagered
  WHERE user_id = OLD.user_id
    AND league_id = OLD.league_id
    AND fixture_id = OLD.fixture_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER restore_credits_on_bet_delete
  AFTER DELETE ON bets
  FOR EACH ROW EXECUTE FUNCTION public.restore_bet_credits();

----------------------------------------------
-- Update updated_at timestamp
----------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_fixtures_updated_at
  BEFORE UPDATE ON fixtures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
