import { supabase } from '../config/supabase';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import type { LeaderboardEntry } from '@moneylab/shared';

class LeagueService {
  async create(userId: string, name: string, creditsPerMatch: number = 100) {
    const { data, error } = await supabase
      .from('leagues')
      .insert({
        name,
        credits_per_match: creditsPerMatch,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-join creator
    await supabase.from('league_members').insert({
      league_id: data.id,
      user_id: userId,
    });

    return data;
  }

  async join(userId: string, invitationCode: string) {
    const { data: league } = await supabase
      .from('leagues')
      .select('id, name')
      .eq('invitation_code', invitationCode.toLowerCase())
      .single();

    if (!league) throw new NotFoundError('Liga con ese codigo');

    // Check if already member
    const { data: existing } = await supabase
      .from('league_members')
      .select('id')
      .eq('league_id', league.id)
      .eq('user_id', userId)
      .single();

    if (existing) throw new BadRequestError('Ya eres miembro de esta liga');

    const { error } = await supabase.from('league_members').insert({
      league_id: league.id,
      user_id: userId,
    });

    if (error) throw error;
    return league;
  }

  async getMyLeagues(userId: string) {
    const { data, error } = await supabase
      .from('league_members')
      .select(`
        league:leagues(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map(d => d.league) || [];
  }

  async getLeaderboard(leagueId: string, userId: string): Promise<LeaderboardEntry[]> {
    // Verify membership
    const { data: member } = await supabase
      .from('league_members')
      .select('id')
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .single();

    if (!member) throw new ForbiddenError('No eres miembro de esta liga');

    const { data: members, error } = await supabase
      .from('league_members')
      .select(`
        user_id,
        total_points,
        profile:profiles!league_members_user_id_fkey(username, display_name, avatar_url)
      `)
      .eq('league_id', leagueId)
      .order('total_points', { ascending: false });

    if (error) throw error;

    // Get bet counts for each member
    const leaderboard: LeaderboardEntry[] = [];

    for (let i = 0; i < (members || []).length; i++) {
      const m = members![i];
      const profile = m.profile as any;

      const { count: betsWon } = await supabase
        .from('bets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', m.user_id)
        .eq('league_id', leagueId)
        .eq('status', 'won');

      const { count: betsLost } = await supabase
        .from('bets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', m.user_id)
        .eq('league_id', leagueId)
        .eq('status', 'lost');

      const { count: betsTotal } = await supabase
        .from('bets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', m.user_id)
        .eq('league_id', leagueId);

      leaderboard.push({
        rank: i + 1,
        user_id: m.user_id,
        username: profile?.username || '',
        display_name: profile?.display_name || null,
        avatar_url: profile?.avatar_url || null,
        total_points: m.total_points,
        bets_won: betsWon || 0,
        bets_lost: betsLost || 0,
        bets_total: betsTotal || 0,
      });
    }

    return leaderboard;
  }
}

export const leagueService = new LeagueService();
