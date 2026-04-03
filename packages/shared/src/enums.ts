export type FixtureStatus =
  | 'scheduled'
  | 'live'
  | 'halftime'
  | 'finished'
  | 'postponed'
  | 'cancelled';

export type BetStatus = 'pending' | 'won' | 'lost' | 'cancelled' | 'refunded';

export type BetTypeSlug = 'match_result' | 'over_under';

export type MatchResultOption = 'home' | 'draw' | 'away';

export type OverUnderOption = 'over_2_5' | 'under_2_5';

export type PlayerPosition = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Attacker';
