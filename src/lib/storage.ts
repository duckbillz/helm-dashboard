'use client';

import { AppData } from './types';
import { supabase } from './supabase';

const STORAGE_KEY = 'helm-dashboard-data';
const VERSION_KEY = 'helm-dashboard-version';
const CURRENT_VERSION = 2; // Bump this to force a reset to defaults
const SUPABASE_ROW_ID = 'singleton';
const DEBOUNCE_MS = 1500;

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
      emailOpenRate: 32.5,
      clickThroughRate: 4.8,
      designPartners: [
        { id: 'dp1', name: 'Prudential', type: 'carrier', stage: 'in-discussion', expectedCloseDate: '2026-05-15' },
        { id: 'dp2', name: 'LPL Financial', type: 'distributor', stage: 'lead', expectedCloseDate: '2026-06-01' },
        { id: 'dp3', name: 'Nationwide', type: 'carrier', stage: 'pilot', expectedCloseDate: '2026-04-01' },
      ],
    },
  ],
  teamMembers: ['CEO', 'CPO', 'Staff Engineer'],
  seriesA: {
    targetRaiseAmount: '$3M',
    targetTimeline: 'Q4 2026',
    notes: '',
    vcPipeline: [
      { id: 'vc1', fundName: 'IA Capital Group', aliveOrDead: 'Alive', wave: '', contactName: 'Andy Lerner', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc2', fundName: 'Insurtech Fund', aliveOrDead: 'Alive', wave: '', contactName: 'David Gritz', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc3', fundName: 'Sierra Ventures', aliveOrDead: 'Alive', wave: '', contactName: 'Mark Fernandes', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc4', fundName: 'Anthemis', aliveOrDead: 'Alive', wave: '', contactName: 'Ali Geramian', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc5', fundName: 'QED Investors', aliveOrDead: 'Alive', wave: '', contactName: 'Laura Bock Amias Gerety', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc6', fundName: 'ManchestorStory', aliveOrDead: 'Alive', wave: '', contactName: 'David Miles', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc7', fundName: 'Eos Venture Partners', aliveOrDead: 'Alive', wave: '', contactName: 'Sam Evans', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc8', fundName: 'AmFam Ventures', aliveOrDead: 'Alive', wave: '', contactName: 'Brittanny', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc9', fundName: 'Core Innovation', aliveOrDead: 'Alive', wave: '', contactName: 'Edwin', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc10', fundName: 'Cambrian', aliveOrDead: 'Alive', wave: '', contactName: 'Rex', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc11', fundName: 'MassMutual Ventures', aliveOrDead: 'Alive', wave: '', contactName: 'Eric Emmons', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc12', fundName: 'MS&AD Ventures', aliveOrDead: 'Alive', wave: '', contactName: 'Jon Soberg', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc13', fundName: 'Bessemer Venture Partners', aliveOrDead: 'Alive', wave: '', contactName: 'Charles', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc14', fundName: 'Nationwide Ventures', aliveOrDead: 'Alive', wave: '', contactName: 'Erik Ross', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc15', fundName: 'Greycroft', aliveOrDead: 'Alive', wave: '', contactName: 'Tyler Olkowski, Ellie Wheeler', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc16', fundName: 'Brewer Lane', aliveOrDead: 'Alive', wave: '', contactName: 'John Kim', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: 'Partner (Strong)', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc17', fundName: 'ViewPoint', aliveOrDead: 'Alive', wave: '', contactName: 'Drew Aldrich', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: 'Partner (Neutral)', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc18', fundName: 'Field Ventures', aliveOrDead: 'Alive', wave: '', contactName: 'Kirby', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: 'Partner (Strong)', optimistConnection: 'Partner (Strong)', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc19', fundName: 'a16z', aliveOrDead: 'Alive', wave: '', contactName: 'Joe Schmidt', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc20', fundName: '8VC', aliveOrDead: 'Alive', wave: '', contactName: 'Bella', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc21', fundName: 'Clocktower Technology Ventures', aliveOrDead: 'Alive', wave: '', contactName: 'Ben Savage', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc22', fundName: 'Stellation', aliveOrDead: 'Alive', wave: '', contactName: 'PB II', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc23', fundName: 'Bain Capital Ventures', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc24', fundName: 'OMERS Ventures', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc25', fundName: 'Box Group', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc26', fundName: 'Eniac', aliveOrDead: 'Alive', wave: '', contactName: 'Nihal', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc27', fundName: 'Commerce', aliveOrDead: 'Alive', wave: '', contactName: 'Vivek', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc28', fundName: 'Tusk Ventures', aliveOrDead: 'Alive', wave: '', contactName: 'Jordan Nof', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc29', fundName: 'Accel', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc30', fundName: 'Lightspeed Venture Partners', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc31', fundName: 'Crosslink Capital', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc32', fundName: 'NYCA', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc33', fundName: 'SixThirty Ventures', aliveOrDead: 'Alive', wave: '', contactName: 'Atul', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc34', fundName: 'Shine Capital', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc35', fundName: 'Comcast Ventures', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc36', fundName: 'MTech Capital', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc37', fundName: 'Portage Ventures', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc38', fundName: 'Greenlight Re Innovations', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc39', fundName: 'Scor Ventures', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc40', fundName: 'True Ventures', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc41', fundName: 'Ribbit Capital', aliveOrDead: 'Alive', wave: '', contactName: 'Matt Wong', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc42', fundName: 'Proper Venture Partners', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc43', fundName: 'Better Tomorrow Ventures', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc44', fundName: 'FinTLV', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc45', fundName: 'Precursor Ventures', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc46', fundName: 'Susa Ventures', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc47', fundName: 'Foundation Capital', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc48', fundName: 'Pear VC', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc49', fundName: 'Afore Capital', aliveOrDead: 'Alive', wave: '', contactName: 'Gaurav Jain', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc50', fundName: 'First Round Capital', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc51', fundName: 'Primary Venture Partners', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc52', fundName: 'NextView Ventures', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc53', fundName: 'Flybridge', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc54', fundName: 'Costanoa Ventures', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc55', fundName: 'SignalFire', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc56', fundName: 'Kindred Ventures', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc57', fundName: 'Haystack', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc58', fundName: 'Newlin VC', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc59', fundName: 'Redsea Ventures', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc60', fundName: 'General Catalyst', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
      { id: 'vc61', fundName: 'Northzone VC', aliveOrDead: 'Alive', wave: '', contactName: '', stageOfConversation: '', sentiment: '', conversationNotes: '', ejfConnection: '', optimistConnection: '', runyonConnection: '', connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '' },
    ],
    teamPlan: [
      { id: 'tp1', role: 'Senior Full-Stack Engineer', status: 'open', targetDate: '2026-06-01', notes: 'Post-raise hire' },
      { id: 'tp2', role: 'Head of Growth', status: 'open', targetDate: '2026-07-01', notes: '' },
    ],
    tractionGoals: [
      { id: 'tg1', milestone: 'Cumulative AUM', target: '$1M', current: '$185K', status: 'in-progress', notes: '' },
      { id: 'tg2', milestone: 'Design Partners Signed', target: '5', current: '1', status: 'in-progress', notes: '' },
      { id: 'tg3', milestone: 'Monthly Active Users', target: '500', current: '120', status: 'in-progress', notes: '' },
    ],
  },
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    const version = storedVersion ? parseInt(storedVersion, 10) : 0;

    // If version is outdated, reset to fresh defaults
    if (version < CURRENT_VERSION) {
      localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
      saveData(DEFAULT_DATA);
      return DEFAULT_DATA;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
  } catch {
    // ignore parse errors
  }
  localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
  saveData(DEFAULT_DATA);
  return DEFAULT_DATA;
}

export function saveData(data: AppData, skipRemote = false): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  if (!skipRemote) {
    debouncedSaveToSupabase(data);
  }
}

// --- Supabase sync ---

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedSaveToSupabase(data: AppData): void {
  if (!supabase) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveToSupabase(data);
  }, DEBOUNCE_MS);
}

async function saveToSupabase(data: AppData): Promise<void> {
  if (!supabase) return;
  try {
    await supabase
      .from('app_data')
      .upsert({
        id: SUPABASE_ROW_ID,
        data: data,
        updated_at: new Date().toISOString(),
      });
  } catch (err) {
    console.error('Failed to save to Supabase:', err);
  }
}

export async function loadDataFromSupabase(): Promise<AppData | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('data')
      .eq('id', SUPABASE_ROW_ID)
      .single();
    if (error || !data?.data) return null;
    const appData = data.data as AppData;
    // Only return if it has real content (not the empty seed)
    if (appData.objectives) return appData;
    return null;
  } catch {
    return null;
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
