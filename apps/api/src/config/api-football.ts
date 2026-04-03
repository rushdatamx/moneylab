import axios from 'axios';
import { env } from './env';

export const apiFootball = axios.create({
  baseURL: `https://${env.API_FOOTBALL_HOST}`,
  headers: {
    'x-apisports-key': env.API_FOOTBALL_KEY,
  },
  timeout: 15000,
});

// World Cup 2026 constants
export const WORLD_CUP_LEAGUE_ID = 1;
export const WORLD_CUP_SEASON = 2026;
