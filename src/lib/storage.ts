'use client';

import { AppData } from './types';

const STORAGE_KEY = 'helm-dashboard-data';

const DEFAULT_DATA: AppData = {
  objectives: [
    {
      id: '1',
      title: 'Launch MVP to first design partners',
      owner: 'CEO',
      status: 'on-track',
      month: '2026-03',
      keyResults: [
        { id: 'kr1', title: 'Onboard 3 carrier design partners', score: 4, notes: '' },
        { id: 'kr2', title: 'Complete core guidance engine', score: 7, notes: '' },
        { id: 'kr3', title: 'Achieve 10 funded accounts', score: 3, notes: '' },
      ],
      comments: [],
    },
    {
      id: '2',
      title: 'Build product foundation for scalable growth',
      owner: 'CPO',
      status: 'at-risk',
      month: '2026-03',
      keyResults: [
        { id: 'kr4', title: 'Ship user account creation flow', score: 8, notes: '' },
        { id: 'kr5', title: 'Create 5 educational videos', score: 5, notes: '' },
        { id: 'kr6', title: 'Implement portfolio guidance for 3 risk profiles', score: 6, notes: '' },
      ],
      comments: [],
    },
  ],
  metrics: [
    {
      id: 'm1',
      month: '2026-03',
      burnRateActual: 45000,
      burnRatePlan: 50000,
      runwayMonths: 14,
      userAccountsAccessible: 120,
      guidanceCompleted: 45,
      videosCreated: 3,
      cumulativeFundedAccounts: 28,
      cumulativeDepositsAUM: 185000,
      designPartners: [
        { id: 'dp1', name: 'Prudential', type: 'carrier', stage: 'in-discussion', expectedCloseDate: '2026-05-15' },
        { id: 'dp2', name: 'LPL Financial', type: 'distributor', stage: 'lead', expectedCloseDate: '2026-06-01' },
        { id: 'dp3', name: 'Nationwide', type: 'carrier', stage: 'pilot', expectedCloseDate: '2026-04-01' },
      ],
    },
  ],
  teamMembers: ['CEO', 'CPO', 'Staff Engineer'],
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  saveData(DEFAULT_DATA);
  return DEFAULT_DATA;
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
