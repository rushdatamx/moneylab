import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Service role client — bypasses RLS, used for all backend operations
// IMPORTANT: Never call auth.signInWithPassword() on this client, it contaminates the session
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Separate client for auth operations (signIn, signUp) that won't contaminate service_role client
export const supabaseAuth = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
