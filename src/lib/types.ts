export interface KeyResult {
  id: string;
  title: string;
  score: number; // 1-10
  notes: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  replies: Comment[];
}

export type OKRStatus = 'on-track' | 'at-risk' | 'behind' | 'not-started';

export interface Objective {
  id: string;
  title: string;
  owner: string;
  status: OKRStatus;
  month: string; // e.g. "2026-03"
  keyResults: KeyResult[];
  comments: Comment[];
}

export interface DesignPartner {
  id: string;
  name: string;
  type: 'carrier' | 'distributor';
  stage: 'lead' | 'in-discussion' | 'pilot' | 'closed';
  expectedCloseDate: string;
}

export interface MonthlyMetrics {
  id: string;
  month: string; // e.g. "2026-03"
  burnRateActual: number;
  burnRatePlan: number;
  runwayMonths: number;
  userAccountsAccessible: number;
  guidanceCompleted: number;
  videosCreated: number;
  cumulativeFundedAccounts: number;
  cumulativeDepositsAUM: number;
  designPartners: DesignPartner[];
}

export interface AppData {
  objectives: Objective[];
  metrics: MonthlyMetrics[];
  teamMembers: string[];
}
