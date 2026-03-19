import { OKRStatus, KeyResult } from './types';

export function getAverageScore(keyResults: KeyResult[]): number {
  if (keyResults.length === 0) return 0;
  const sum = keyResults.reduce((acc, kr) => acc + kr.score, 0);
  return Math.round((sum / keyResults.length) * 10) / 10;
}

export function getScoreClass(score: number): string {
  if (score >= 7) return 'score-high';
  if (score >= 4) return 'score-mid';
  return 'score-low';
}

export function getStatusLabel(status: OKRStatus): string {
  switch (status) {
    case 'on-track': return 'On Track';
    case 'at-risk': return 'At Risk';
    case 'behind': return 'Behind';
    case 'not-started': return 'Not Started';
  }
}

export function getStatusClass(status: OKRStatus): string {
  return `status-${status}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(parseInt(year), parseInt(m) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getStageLabel(stage: string): string {
  switch (stage) {
    case 'lead': return 'Lead';
    case 'in-discussion': return 'In Discussion';
    case 'pilot': return 'Pilot';
    case 'closed': return 'Closed';
    default: return stage;
  }
}

export function getStageColor(stage: string): string {
  switch (stage) {
    case 'lead': return '#B8B8A8';
    case 'in-discussion': return '#D4883A';
    case 'pilot': return '#3A7CA5';
    case 'closed': return '#2D5A3D';
    default: return '#B8B8A8';
  }
}
