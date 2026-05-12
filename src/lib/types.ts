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
  emailOpenRate: number; // percentage
  clickThroughRate: number; // percentage
  designPartners: DesignPartner[];
}

export interface VCContact {
  id: string;
  fundName: string;
  aliveOrDead: string;
  wave: string;
  contactName: string;
  stageOfConversation: string;
  sentiment: string;
  conversationNotes: string;
  lastContact?: string;        // ISO 'YYYY-MM-DD' or '' — date of last touch
  ejfConnection: string;
  optimistConnection: string;
  runyonConnection: string;
  connectedBy: string;
  dataRoom: string;
  customerCalls: string;
  insurtechFintechInvestments: string;
}

export interface TeamMilestone {
  id: string;
  role: string;
  status: 'open' | 'interviewing' | 'offer' | 'filled';
  targetDate: string;
  notes: string;
}

export interface TractionMilestone {
  id: string;
  milestone: string;
  target: string;
  current: string;
  status: 'not-started' | 'in-progress' | 'achieved';
  notes: string;
}

export interface SeriesAData {
  vcPipeline: VCContact[];
  teamPlan: TeamMilestone[];
  tractionGoals: TractionMilestone[];
  targetRaiseAmount: string;
  targetTimeline: string;
  notes: string;
}

// --- People & SaaS / Subscription tracking ---

export interface Person {
  id: string;
  name: string;
  email: string;
  department: string;
  jobTitle: string;
  status: 'active' | 'inactive';
  notes: string;
}

export type ToolCategory =
  | 'Communication'
  | 'Engineering'
  | 'Productivity'
  | 'Marketing'
  | 'HR / People'
  | 'Security'
  | 'Finance'
  | 'Other';

export type ToolStatus = 'Active' | 'Trial' | 'Cancelled' | 'Pending';
export type PricingModel = 'Per User' | 'Flat' | 'Usage-based' | 'Free';
export type BillingCycle = 'Monthly' | 'Annual' | 'Quarterly';

export interface SaaSTool {
  id: string;
  name: string;
  category: ToolCategory;
  vendor: string;
  plan: string;
  pricingModel: PricingModel;
  costPerUserMo: number;        // For "Flat", treat as flat monthly cost
  licensedSeats: number;
  billingCycle: BillingCycle;
  paymentMethod: string;
  internalOwner: string;
  vendorContact: string;
  vendorEmail: string;
  contractStart: string;        // ISO 'YYYY-MM-DD' or ''
  renewalDate: string;          // ISO 'YYYY-MM-DD' or ''
  autoRenew: boolean;
  noticePeriodDays: number;
  status: ToolStatus;
  notes: string;
}

export interface SaaSAssignment {
  id: string;
  personId: string;
  toolId: string;
  dateAssigned: string;         // ISO 'YYYY-MM-DD' or ''
  notes: string;
}

export interface SaaSData {
  tools: SaaSTool[];
  assignments: SaaSAssignment[];
}

export interface AppData {
  objectives: Objective[];
  metrics: MonthlyMetrics[];
  teamMembers: string[];        // legacy: role labels for OKR owners / comment authors
  seriesA: SeriesAData;
  people: Person[];             // named people (Farron, Anthony, future hires)
  saas: SaaSData;               // tool catalog + user→tool assignments
}
