'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { League, LeaderboardEntry, CreateLeagueRequest, JoinLeagueRequest } from '@moneylab/shared';

export function useMyLeagues() {
  return useQuery({
    queryKey: ['leagues'],
    queryFn: () => api.get<League[]>('/leagues'),
  });
}

export function useLeaderboard(leagueId: string) {
  return useQuery({
    queryKey: ['leagues', leagueId, 'leaderboard'],
    queryFn: () => api.get<LeaderboardEntry[]>(`/leagues/${leagueId}/leaderboard`),
    enabled: !!leagueId,
  });
}

export function useCreateLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeagueRequest) => api.post<League>('/leagues', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
    },
  });
}

export function useJoinLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JoinLeagueRequest) => api.post<League>('/leagues/join', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
    },
  });
}
