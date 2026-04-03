'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { FixtureWithTeams, FixtureDetail, FixtureBetOptions, H2HResponse } from '@moneylab/shared';

export function useFixtures(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters).toString();
  return useQuery({
    queryKey: ['fixtures', filters],
    queryFn: () => api.get<FixtureWithTeams[]>(`/fixtures${params ? `?${params}` : ''}`),
  });
}

export function useUpcomingFixtures(limit = 5) {
  return useQuery({
    queryKey: ['fixtures', 'upcoming', limit],
    queryFn: () => api.get<FixtureWithTeams[]>(`/fixtures/upcoming?limit=${limit}`),
  });
}

export function useLiveFixtures() {
  return useQuery({
    queryKey: ['fixtures', 'live'],
    queryFn: () => api.get<FixtureWithTeams[]>('/fixtures/live'),
    refetchInterval: 30000,
  });
}

export function useFixture(id: string) {
  return useQuery({
    queryKey: ['fixture', id],
    queryFn: () => api.get<FixtureDetail>(`/fixtures/${id}`),
    enabled: !!id,
  });
}

export function useFixtureH2H(id: string) {
  return useQuery({
    queryKey: ['fixture', id, 'h2h'],
    queryFn: () => api.get<H2HResponse>(`/fixtures/${id}/h2h`),
    enabled: !!id,
  });
}

export function useFixtureBetOptions(id: string) {
  return useQuery({
    queryKey: ['fixture', id, 'bet-options'],
    queryFn: () => api.get<FixtureBetOptions>(`/fixtures/${id}/bet-options`),
    enabled: !!id,
  });
}
