'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { BetWithDetails, PlaceBetRequest } from '@moneylab/shared';

export function useMyBets() {
  return useQuery({
    queryKey: ['bets', 'my'],
    queryFn: () => api.get<BetWithDetails[]>('/bets/my'),
  });
}

export function usePlaceBet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlaceBetRequest) => api.post('/bets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bets'] });
    },
  });
}

export function useCancelBet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (betId: string) => api.delete(`/bets/${betId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bets'] });
    },
  });
}

export function useFixtureLeagueBets(fixtureId: string, leagueId: string) {
  return useQuery({
    queryKey: ['bets', 'fixture', fixtureId, 'league', leagueId],
    queryFn: () => api.get(`/bets/fixture/${fixtureId}/league/${leagueId}`),
    enabled: !!fixtureId && !!leagueId,
  });
}
