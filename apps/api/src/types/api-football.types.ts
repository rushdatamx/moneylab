// API-Football response types

export interface ApiFootballResponse<T> {
  get: string;
  parameters: Record<string, string>;
  errors: Record<string, string>;
  results: number;
  paging: { current: number; total: number };
  response: T[];
}

export interface AFTeam {
  team: {
    id: number;
    name: string;
    code: string;
    country: string;
    logo: string;
  };
}

export interface AFFixture {
  fixture: {
    id: number;
    date: string;
    venue: { name: string; city: string } | null;
    status: {
      short: string;
      long: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    round: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

export interface AFFixtureStatistic {
  team: { id: number; name: string; logo: string };
  statistics: Array<{
    type: string;
    value: number | string | null;
  }>;
}

export interface AFFixtureEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
}

export interface AFPrediction {
  predictions: {
    winner: { id: number; name: string; comment: string } | null;
    win_or_draw: boolean;
    under_over: string | null;
    goals: { home: string; away: string };
    advice: string;
    percent: { home: string; draw: string; away: string };
  };
  comparison: Record<string, { home: string; away: string }>;
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
}

export interface AFPlayer {
  player: {
    id: number;
    name: string;
    age: number;
    number: number | null;
    position: string;
    photo: string;
  };
}

export interface AFSquad {
  team: { id: number; name: string; logo: string };
  players: AFPlayer[];
}

export interface AFStanding {
  league: {
    id: number;
    standings: Array<Array<{
      rank: number;
      team: { id: number; name: string; logo: string };
      group: string;
      points: number;
      all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
    }>>;
  };
}

// Map API-Football status codes to our status
export function mapFixtureStatus(short: string): string {
  const map: Record<string, string> = {
    TBD: 'scheduled',
    NS: 'scheduled',
    '1H': 'live',
    HT: 'halftime',
    '2H': 'live',
    ET: 'live',
    P: 'live',
    FT: 'finished',
    AET: 'finished',
    PEN: 'finished',
    BT: 'live',
    SUSP: 'postponed',
    INT: 'live',
    PST: 'postponed',
    CANC: 'cancelled',
    ABD: 'cancelled',
    AWD: 'finished',
    WO: 'finished',
    LIVE: 'live',
  };
  return map[short] || 'scheduled';
}
