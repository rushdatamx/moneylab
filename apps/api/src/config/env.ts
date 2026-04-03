import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  API_FOOTBALL_KEY: process.env.API_FOOTBALL_KEY!,
  API_FOOTBALL_HOST: process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io',
  ADMIN_API_KEY: process.env.ADMIN_API_KEY!,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
