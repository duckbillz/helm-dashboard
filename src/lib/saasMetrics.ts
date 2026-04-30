import { Person, SaaSAssignment, SaaSData, SaaSTool, ToolCategory } from './types';

export type AlertLevel = 'overdue' | 'urgent' | 'review' | 'on-track' | 'none';

export interface ToolMetrics {
  activeAssignments: number;
  monthlySpend: number;
  annualSpend: number;
  notificationDueDate: string | null; // ISO 'YYYY-MM-DD' or null
  daysUntilNotification: number | null;
  alertLevel: AlertLevel;
}

export function getActiveAssignmentsForTool(
  toolId: string,
  assignments: SaaSAssignment[],
): SaaSAssignment[] {
  return assignments.filter(a => a.toolId === toolId);
}

export function getActiveAssignmentsForPerson(
  personId: string,
  assignments: SaaSAssignment[],
): SaaSAssignment[] {
  return assignments.filter(a => a.personId === personId);
}

export function deriveToolMetrics(
  tool: SaaSTool,
  assignments: SaaSAssignment[],
  today: Date = new Date(),
): ToolMetrics {
  const activeAssignments = getActiveAssignmentsForTool(tool.id, assignments).length;
  // Per-user pricing scales with assignments. Flat / Usage-based / Free use the
  // costPerUserMo as the flat monthly spend regardless of seat count.
  const monthlySpend =
    tool.pricingModel === 'Per User'
      ? tool.costPerUserMo * activeAssignments
      : tool.costPerUserMo;
  const annualSpend = monthlySpend * 12;

  let notificationDueDate: string | null = null;
  let daysUntilNotification: number | null = null;
  if (tool.renewalDate) {
    const renewal = new Date(tool.renewalDate + 'T00:00:00');
    const due = new Date(renewal);
    due.setDate(due.getDate() - (tool.noticePeriodDays || 0));
    notificationDueDate = due.toISOString().slice(0, 10);
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    daysUntilNotification = Math.round(
      (due.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
    );
  }
  const alertLevel = getAlertLevel(daysUntilNotification);
  return {
    activeAssignments,
    monthlySpend,
    annualSpend,
    notificationDueDate,
    daysUntilNotification,
    alertLevel,
  };
}

export function getAlertLevel(days: number | null): AlertLevel {
  if (days === null) return 'none';
  if (days < 0) return 'overdue';
  if (days <= 14) return 'urgent';
  if (days <= 60) return 'review';
  return 'on-track';
}

export function alertColor(level: AlertLevel): string {
  switch (level) {
    case 'overdue': return '#C62828';
    case 'urgent':  return '#D4883A';
    case 'review':  return '#3A7CA5';
    case 'on-track':return '#2E7D32';
    case 'none':    return '#B8B8A8';
  }
}

export function alertLabel(level: AlertLevel): string {
  switch (level) {
    case 'overdue':  return 'Overdue';
    case 'urgent':   return 'Act now';
    case 'review':   return 'Review soon';
    case 'on-track': return 'On track';
    case 'none':     return '—';
  }
}

export function alertBg(level: AlertLevel): string {
  switch (level) {
    case 'overdue':  return '#FFEBEE';
    case 'urgent':   return '#FFF3E0';
    case 'review':   return '#E3F2FD';
    case 'on-track': return '#E8F5E9';
    case 'none':     return '#F5F5F5';
  }
}

export interface PerUserCost {
  person: Person;
  monthly: number;
  annual: number;
  toolCount: number;
}

export interface SaaSSummary {
  totalMonthly: number;
  totalAnnual: number;
  activeToolsCount: number;
  totalToolsCount: number;
  activeUsersCount: number;
  totalUsersCount: number;
  avgCostPerUser: number;
  alertCount: number;                          // overdue + urgent (≤14 days)
  reviewSoonCount: number;                     // 15–60 days
  spendByCategory: Record<ToolCategory, number>;
  perUserCost: PerUserCost[];
}

export function deriveSaaSSummary(
  saas: SaaSData,
  people: Person[],
  today: Date = new Date(),
): SaaSSummary {
  const tools = saas.tools;
  const assignments = saas.assignments;
  let totalMonthly = 0;
  let alertCount = 0;
  let reviewSoonCount = 0;
  const spendByCategory: Record<string, number> = {};

  for (const tool of tools) {
    if (tool.status !== 'Active') continue;
    const m = deriveToolMetrics(tool, assignments, today);
    totalMonthly += m.monthlySpend;
    spendByCategory[tool.category] = (spendByCategory[tool.category] || 0) + m.monthlySpend;
    if (m.alertLevel === 'overdue' || m.alertLevel === 'urgent') alertCount += 1;
    else if (m.alertLevel === 'review') reviewSoonCount += 1;
  }

  const activeTools = tools.filter(t => t.status === 'Active');
  const activePeople = people.filter(p => p.status === 'active');

  const perUserCost: PerUserCost[] = activePeople.map(person => {
    const myAssignments = getActiveAssignmentsForPerson(person.id, assignments);
    let monthly = 0;
    let toolCount = 0;
    for (const a of myAssignments) {
      const tool = tools.find(t => t.id === a.toolId);
      if (!tool || tool.status !== 'Active') continue;
      // Per-user share of the tool cost. Flat tools shared across active assignments.
      if (tool.pricingModel === 'Per User') {
        monthly += tool.costPerUserMo;
      } else {
        const activeCount = getActiveAssignmentsForTool(tool.id, assignments).length;
        monthly += activeCount > 0 ? tool.costPerUserMo / activeCount : 0;
      }
      toolCount += 1;
    }
    return { person, monthly, annual: monthly * 12, toolCount };
  });

  const avgCostPerUser =
    activePeople.length > 0 ? totalMonthly / activePeople.length : 0;

  return {
    totalMonthly,
    totalAnnual: totalMonthly * 12,
    activeToolsCount: activeTools.length,
    totalToolsCount: tools.length,
    activeUsersCount: activePeople.length,
    totalUsersCount: people.length,
    avgCostPerUser,
    alertCount,
    reviewSoonCount,
    spendByCategory: spendByCategory as Record<ToolCategory, number>,
    perUserCost,
  };
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatMoneyCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  'Communication',
  'Engineering',
  'Productivity',
  'Marketing',
  'HR / People',
  'Security',
  'Finance',
  'Other',
];

export const TOOL_STATUSES: SaaSTool['status'][] = [
  'Active',
  'Trial',
  'Cancelled',
  'Pending',
];

export const PRICING_MODELS: SaaSTool['pricingModel'][] = [
  'Per User',
  'Flat',
  'Usage-based',
  'Free',
];

export const BILLING_CYCLES: SaaSTool['billingCycle'][] = [
  'Monthly',
  'Annual',
  'Quarterly',
];
