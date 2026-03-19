'use client';

import { useState } from 'react';
import { MonthlyMetrics, DesignPartner } from '../lib/types';
import { generateId } from '../lib/storage';
import { formatCurrency, formatMonth, getCurrentMonth, getStageLabel, getStageColor } from '../lib/helpers';

interface MetricsTabProps {
  metrics: MonthlyMetrics[];
  onUpdate: (metrics: MonthlyMetrics[]) => void;
}

export default function MetricsTab({ metrics, onUpdate }: MetricsTabProps) {
  const [showAddMonth, setShowAddMonth] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = [...metrics].sort((a, b) => b.month.localeCompare(a.month));

  function handleUpdateMetric(updated: MonthlyMetrics) {
    onUpdate(metrics.map(m => m.id === updated.id ? updated : m));
    setEditingId(null);
  }

  function handleDeleteMetric(id: string) {
    onUpdate(metrics.filter(m => m.id !== id));
  }

  function handleAddMonth(m: MonthlyMetrics) {
    onUpdate([m, ...metrics]);
    setShowAddMonth(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1A1A1A' }}>Key Metrics</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7A7A6E' }}>
            Track financial health, product traction &amp; partner pipeline
          </p>
        </div>
        <button onClick={() => setShowAddMonth(true)} className="btn-primary" style={{ fontSize: 14, padding: '10px 20px' }}>
          + Add Month
        </button>
      </div>

      {sorted.map(m => (
        <MonthMetricsCard
          key={m.id}
          data={m}
          isEditing={editingId === m.id}
          onEdit={() => setEditingId(m.id)}
          onSave={handleUpdateMetric}
          onCancel={() => setEditingId(null)}
          onDelete={() => handleDeleteMetric(m.id)}
        />
      ))}

      {sorted.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ fontSize: 15, color: '#7A7A6E', margin: 0 }}>
            No metrics data yet. Add your first month to get started.
          </p>
        </div>
      )}

      {showAddMonth && (
        <AddMonthModal onAdd={handleAddMonth} onClose={() => setShowAddMonth(false)} />
      )}
    </div>
  );
}

function MetricCard({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <div style={{
      background: '#FAFAF5',
      border: '1px solid #F5F0DC',
      borderRadius: 8,
      padding: 16,
      flex: 1,
      minWidth: 160,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A' }}>{value}</div>
      {subValue && (
        <div style={{ fontSize: 12, color: '#7A7A6E', marginTop: 2 }}>{subValue}</div>
      )}
    </div>
  );
}

function MonthMetricsCard({
  data,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  data: MonthlyMetrics;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (m: MonthlyMetrics) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [editData, setEditData] = useState<MonthlyMetrics>(data);

  function handleSave() {
    onSave(editData);
  }

  const burnVariance = data.burnRatePlan - data.burnRateActual;
  const burnVariancePercent = data.burnRatePlan > 0
    ? Math.round((burnVariance / data.burnRatePlan) * 100)
    : 0;

  if (isEditing) {
    return (
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>
          Edit — {formatMonth(data.month)}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FieldInput label="Burn Rate (Actual)" type="number" value={editData.burnRateActual}
            onChange={v => setEditData({ ...editData, burnRateActual: Number(v) })} />
          <FieldInput label="Burn Rate (Plan)" type="number" value={editData.burnRatePlan}
            onChange={v => setEditData({ ...editData, burnRatePlan: Number(v) })} />
          <FieldInput label="Runway (months)" type="number" value={editData.runwayMonths}
            onChange={v => setEditData({ ...editData, runwayMonths: Number(v) })} />
          <FieldInput label="User Accounts Accessible" type="number" value={editData.userAccountsAccessible}
            onChange={v => setEditData({ ...editData, userAccountsAccessible: Number(v) })} />
          <FieldInput label="Guidance Completed" type="number" value={editData.guidanceCompleted}
            onChange={v => setEditData({ ...editData, guidanceCompleted: Number(v) })} />
          <FieldInput label="Videos Created" type="number" value={editData.videosCreated}
            onChange={v => setEditData({ ...editData, videosCreated: Number(v) })} />
          <FieldInput label="Cumulative Funded Accounts" type="number" value={editData.cumulativeFundedAccounts}
            onChange={v => setEditData({ ...editData, cumulativeFundedAccounts: Number(v) })} />
          <FieldInput label="Cumulative Deposits / AUM" type="number" value={editData.cumulativeDepositsAUM}
            onChange={v => setEditData({ ...editData, cumulativeDepositsAUM: Number(v) })} />
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Design Partner Pipeline
            </label>
            <button
              onClick={() => setEditData({
                ...editData,
                designPartners: [...editData.designPartners, {
                  id: generateId(),
                  name: '',
                  type: 'carrier',
                  stage: 'lead',
                  expectedCloseDate: '',
                }],
              })}
              className="btn-secondary"
              style={{ padding: '2px 10px', fontSize: 12 }}
            >
              + Add Partner
            </button>
          </div>
          {editData.designPartners.map((dp, idx) => (
            <div key={dp.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input
                value={dp.name}
                onChange={e => {
                  const updated = [...editData.designPartners];
                  updated[idx] = { ...dp, name: e.target.value };
                  setEditData({ ...editData, designPartners: updated });
                }}
                placeholder="Partner name"
                style={{ flex: 2 }}
              />
              <select
                value={dp.type}
                onChange={e => {
                  const updated = [...editData.designPartners];
                  updated[idx] = { ...dp, type: e.target.value as DesignPartner['type'] };
                  setEditData({ ...editData, designPartners: updated });
                }}
                style={{ flex: 1 }}
              >
                <option value="carrier">Carrier</option>
                <option value="distributor">Distributor</option>
              </select>
              <select
                value={dp.stage}
                onChange={e => {
                  const updated = [...editData.designPartners];
                  updated[idx] = { ...dp, stage: e.target.value as DesignPartner['stage'] };
                  setEditData({ ...editData, designPartners: updated });
                }}
                style={{ flex: 1 }}
              >
                <option value="lead">Lead</option>
                <option value="in-discussion">In Discussion</option>
                <option value="pilot">Pilot</option>
                <option value="closed">Closed</option>
              </select>
              <input
                type="date"
                value={dp.expectedCloseDate}
                onChange={e => {
                  const updated = [...editData.designPartners];
                  updated[idx] = { ...dp, expectedCloseDate: e.target.value };
                  setEditData({ ...editData, designPartners: updated });
                }}
                style={{ flex: 1 }}
              />
              <button
                onClick={() => setEditData({
                  ...editData,
                  designPartners: editData.designPartners.filter(p => p.id !== dp.id),
                })}
                style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: 16 }}
              >
                x
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{formatMonth(data.month)}</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onEdit} className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}>Edit</button>
          <button onClick={onDelete} className="btn-danger" style={{ padding: '4px 12px', fontSize: 12 }}>Delete</button>
        </div>
      </div>

      {/* Financial Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <MetricCard
          label="Burn Rate (Actual)"
          value={formatCurrency(data.burnRateActual)}
          subValue={`Plan: ${formatCurrency(data.burnRatePlan)}`}
        />
        <MetricCard
          label="Burn Variance"
          value={`${burnVariance >= 0 ? '+' : ''}${formatCurrency(burnVariance)}`}
          subValue={`${burnVariancePercent >= 0 ? '' : ''}${burnVariancePercent}% ${burnVariance >= 0 ? 'under' : 'over'} plan`}
        />
        <MetricCard
          label="Runway"
          value={`${data.runwayMonths} months`}
        />
      </div>

      {/* Traction Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <MetricCard label="User Accounts" value={data.userAccountsAccessible.toLocaleString()} />
        <MetricCard label="Guidance Completed" value={data.guidanceCompleted.toLocaleString()} />
        <MetricCard label="Videos Created" value={data.videosCreated.toLocaleString()} />
        <MetricCard label="Funded Accounts" value={data.cumulativeFundedAccounts.toLocaleString()} />
        <MetricCard label="Deposits / AUM" value={formatCurrency(data.cumulativeDepositsAUM)} />
      </div>

      {/* Design Partners */}
      {data.designPartners.length > 0 && (
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Design Partner Pipeline ({data.designPartners.length})
          </h4>
          <div style={{ border: '1px solid #F5F0DC', borderRadius: 6, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F5F0DC' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Partner</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Type</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Stage</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Expected Close</th>
                </tr>
              </thead>
              <tbody>
                {data.designPartners.map(dp => (
                  <tr key={dp.id} style={{ borderTop: '1px solid #F5F0DC' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 500 }}>{dp.name}</td>
                    <td style={{ padding: '8px 12px', textTransform: 'capitalize' }}>{dp.type}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'white',
                        background: getStageColor(dp.stage),
                      }}>
                        {getStageLabel(dp.stage)}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {dp.expectedCloseDate
                        ? new Date(dp.expectedCloseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldInput({ label, type, value, onChange }: {
  label: string;
  type: string;
  value: number;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ marginTop: 4 }}
      />
    </div>
  );
}

function AddMonthModal({ onAdd, onClose }: { onAdd: (m: MonthlyMetrics) => void; onClose: () => void }) {
  const [month, setMonth] = useState(getCurrentMonth());

  function handleSubmit() {
    onAdd({
      id: generateId(),
      month,
      burnRateActual: 0,
      burnRatePlan: 0,
      runwayMonths: 0,
      userAccountsAccessible: 0,
      guidanceCompleted: 0,
      videosCreated: 0,
      cumulativeFundedAccounts: 0,
      cumulativeDepositsAUM: 0,
      designPartners: [],
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 360 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>Add Month</h3>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Month</label>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ marginTop: 4 }} autoFocus />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary">Add</button>
        </div>
      </div>
    </div>
  );
}
