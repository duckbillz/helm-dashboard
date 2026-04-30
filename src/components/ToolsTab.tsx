'use client';

import { useMemo, useState } from 'react';
import {
  Person,
  SaaSAssignment,
  SaaSData,
  SaaSTool,
  ToolCategory,
} from '../lib/types';
import { generateId } from '../lib/storage';
import {
  alertBg,
  alertColor,
  alertLabel,
  AlertLevel,
  BILLING_CYCLES,
  deriveSaaSSummary,
  deriveToolMetrics,
  formatDate,
  formatMoney,
  formatMoneyCompact,
  PRICING_MODELS,
  TOOL_CATEGORIES,
  TOOL_STATUSES,
} from '../lib/saasMetrics';

interface ToolsTabProps {
  saas: SaaSData;
  people: Person[];
  onUpdateSaas: (saas: SaaSData) => void;
  onUpdatePeople: (people: Person[]) => void;
}

type SectionKey = 'tools' | 'people' | 'assignments';

export default function ToolsTab({ saas, people, onUpdateSaas, onUpdatePeople }: ToolsTabProps) {
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    tools: true,
    people: false,
    assignments: false,
  });
  const [drawerToolId, setDrawerToolId] = useState<string | null>(null);
  const [showAddTool, setShowAddTool] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);

  const today = useMemo(() => new Date(), []);
  const summary = useMemo(
    () => deriveSaaSSummary(saas, people, today),
    [saas, people, today],
  );

  const drawerTool = drawerToolId ? saas.tools.find(t => t.id === drawerToolId) || null : null;

  function toggle(key: SectionKey) {
    setOpen(o => ({ ...o, [key]: !o[key] }));
  }

  function updateTool(updated: SaaSTool) {
    onUpdateSaas({
      ...saas,
      tools: saas.tools.map(t => (t.id === updated.id ? updated : t)),
    });
  }
  function deleteTool(id: string) {
    onUpdateSaas({
      ...saas,
      tools: saas.tools.filter(t => t.id !== id),
      assignments: saas.assignments.filter(a => a.toolId !== id),
    });
    if (drawerToolId === id) setDrawerToolId(null);
  }
  function addTool(tool: SaaSTool) {
    onUpdateSaas({ ...saas, tools: [...saas.tools, tool] });
    setShowAddTool(false);
  }

  function updatePerson(updated: Person) {
    onUpdatePeople(people.map(p => (p.id === updated.id ? updated : p)));
  }
  function deletePerson(id: string) {
    onUpdatePeople(people.filter(p => p.id !== id));
    onUpdateSaas({
      ...saas,
      assignments: saas.assignments.filter(a => a.personId !== id),
    });
  }
  function addPerson(p: Person) {
    onUpdatePeople([...people, p]);
    setShowAddPerson(false);
  }

  function addAssignment(a: SaaSAssignment) {
    onUpdateSaas({ ...saas, assignments: [...saas.assignments, a] });
    setShowAddAssignment(false);
  }
  function deleteAssignment(id: string) {
    onUpdateSaas({
      ...saas,
      assignments: saas.assignments.filter(a => a.id !== id),
    });
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1A1A1A' }}>
            Tools &amp; Subscriptions
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7A7A6E' }}>
            SaaS catalog, user assignments, and renewal tracking — all costs update automatically.
          </p>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12,
        marginBottom: 16,
      }}>
        <KpiCard label="Monthly spend"   value={formatMoney(summary.totalMonthly)} sub={`${summary.activeToolsCount} active tool${summary.activeToolsCount === 1 ? '' : 's'}`} />
        <KpiCard label="Annual spend"    value={formatMoneyCompact(summary.totalAnnual)} sub="run-rate" />
        <KpiCard label="Active users"    value={String(summary.activeUsersCount)} sub={`${summary.totalUsersCount} total`} />
        <KpiCard label="Cost / user / mo" value={formatMoney(summary.avgCostPerUser)} sub="active users" />
        <KpiCard
          label="Renewals ≤30d"
          value={String(summary.alertCount)}
          sub={summary.reviewSoonCount > 0 ? `${summary.reviewSoonCount} review soon` : 'on track'}
          accent={summary.alertCount > 0 ? '#C62828' : undefined}
        />
      </div>

      {/* Alert banner */}
      {summary.alertCount > 0 && (
        <RenewalAlertBanner saas={saas} today={today} onClickTool={id => setDrawerToolId(id)} />
      )}

      {/* Spend by category */}
      <SpendByCategory summary={summary} />

      {/* Sections */}
      <Section
        title="Tools"
        count={saas.tools.length}
        isOpen={open.tools}
        onToggle={() => toggle('tools')}
        action={<button className="btn-primary" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => setShowAddTool(true)}>+ Add tool</button>}
      >
        <ToolsTable
          tools={saas.tools}
          assignments={saas.assignments}
          today={today}
          onRowClick={id => setDrawerToolId(id)}
        />
      </Section>

      <Section
        title="Cost per user"
        count={summary.perUserCost.length}
        isOpen={open.people}
        onToggle={() => toggle('people')}
        action={<button className="btn-primary" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => setShowAddPerson(true)}>+ Add user</button>}
      >
        <PeopleTable
          people={people}
          summary={summary}
          onUpdate={updatePerson}
          onDelete={deletePerson}
        />
      </Section>

      <Section
        title="Assignments"
        count={saas.assignments.length}
        isOpen={open.assignments}
        onToggle={() => toggle('assignments')}
        action={<button className="btn-primary" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => setShowAddAssignment(true)}>+ Assign tool</button>}
      >
        <AssignmentsTable
          assignments={saas.assignments}
          tools={saas.tools}
          people={people}
          onDelete={deleteAssignment}
        />
      </Section>

      {/* Modals + drawer */}
      {showAddTool && (
        <ToolEditModal
          mode="add"
          onSave={addTool}
          onClose={() => setShowAddTool(false)}
        />
      )}
      {showAddPerson && (
        <PersonEditModal
          mode="add"
          onSave={addPerson}
          onClose={() => setShowAddPerson(false)}
        />
      )}
      {showAddAssignment && (
        <AssignmentAddModal
          tools={saas.tools}
          people={people}
          existingAssignments={saas.assignments}
          onSave={addAssignment}
          onClose={() => setShowAddAssignment(false)}
        />
      )}

      {drawerTool && (
        <ToolDetailDrawer
          tool={drawerTool}
          assignments={saas.assignments.filter(a => a.toolId === drawerTool.id)}
          people={people}
          today={today}
          onClose={() => setDrawerToolId(null)}
          onUpdate={updateTool}
          onDelete={() => deleteTool(drawerTool.id)}
        />
      )}
    </div>
  );
}

// ---------- KPI Card ----------
function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{
      background: '#FAFAF5',
      border: '1px solid #F5F0DC',
      borderLeft: accent ? `3px solid ${accent}` : '1px solid #F5F0DC',
      borderRadius: 8,
      padding: 14,
    }}>
      <div style={{ fontSize: 11, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent || '#1A1A1A', lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: '#7A7A6E', marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

// ---------- Renewal alert banner ----------
function RenewalAlertBanner({
  saas,
  today,
  onClickTool,
}: {
  saas: SaaSData;
  today: Date;
  onClickTool: (id: string) => void;
}) {
  const alerts = saas.tools
    .filter(t => t.status === 'Active')
    .map(t => ({ tool: t, m: deriveToolMetrics(t, saas.assignments, today) }))
    .filter(x => x.m.alertLevel === 'overdue' || x.m.alertLevel === 'urgent')
    .sort((a, b) => (a.m.daysUntilNotification ?? 0) - (b.m.daysUntilNotification ?? 0));

  return (
    <div style={{
      background: '#FFEBEE',
      border: '1px solid #E57373',
      borderRadius: 8,
      padding: '12px 16px',
      marginBottom: 16,
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#C62828', marginBottom: 8 }}>
        ⚠ {alerts.length} tool{alerts.length === 1 ? '' : 's'} need attention
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {alerts.map(({ tool, m }) => (
          <button
            key={tool.id}
            onClick={() => onClickTool(tool.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255,255,255,0.6)',
              border: 'none',
              borderRadius: 6,
              padding: '6px 10px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 13,
              color: '#1A1A1A',
            }}
          >
            <AlertBadge level={m.alertLevel} />
            <span style={{ fontWeight: 600 }}>{tool.name}</span>
            <span style={{ color: '#7A7A6E' }}>
              renews {formatDate(tool.renewalDate)} · notice by {formatDate(m.notificationDueDate || '')}
              {m.daysUntilNotification !== null && (
                <> · <strong style={{ color: alertColor(m.alertLevel) }}>
                  {m.daysUntilNotification < 0 ? `${Math.abs(m.daysUntilNotification)}d overdue` : `${m.daysUntilNotification}d`}
                </strong></>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AlertBadge({ level }: { level: AlertLevel }) {
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 4,
      background: alertBg(level),
      color: alertColor(level),
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      {alertLabel(level)}
    </span>
  );
}

// ---------- Spend by Category ----------
function SpendByCategory({ summary }: { summary: ReturnType<typeof deriveSaaSSummary> }) {
  const entries = Object.entries(summary.spendByCategory)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a) as [ToolCategory, number][];
  if (entries.length === 0) return null;
  const max = Math.max(...entries.map(([, v]) => v));
  return (
    <div className="card" style={{ marginBottom: 16, padding: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
        Spend by category
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries.map(([cat, val]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 130, fontSize: 13, color: '#1A1A1A' }}>{cat}</div>
            <div style={{ flex: 1, height: 10, background: '#F5F0DC', borderRadius: 5, overflow: 'hidden' }}>
              <div style={{
                width: `${(val / max) * 100}%`,
                height: '100%',
                background: '#2D5A3D',
                borderRadius: 5,
                transition: 'width 0.3s',
              }} />
            </div>
            <div style={{ width: 90, fontSize: 13, fontWeight: 600, textAlign: 'right' }}>
              {formatMoney(val)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Generic collapsible section ----------
function Section({
  title,
  count,
  isOpen,
  onToggle,
  action,
  children,
}: {
  title: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        cursor: 'pointer',
        borderBottom: isOpen ? '1px solid #F5F0DC' : 'none',
      }} onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display: 'inline-block',
            width: 14,
            transition: 'transform 0.15s',
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            fontSize: 12,
            color: '#7A7A6E',
          }}>▶</span>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</h3>
          <span style={{ fontSize: 12, color: '#7A7A6E' }}>({count})</span>
        </div>
        {action && <div onClick={e => e.stopPropagation()}>{action}</div>}
      </div>
      {isOpen && <div style={{ padding: 16 }}>{children}</div>}
    </div>
  );
}

// ---------- Tools table ----------
function ToolsTable({
  tools,
  assignments,
  today,
  onRowClick,
}: {
  tools: SaaSTool[];
  assignments: SaaSAssignment[];
  today: Date;
  onRowClick: (id: string) => void;
}) {
  if (tools.length === 0) {
    return <p style={{ fontSize: 13, color: '#7A7A6E', textAlign: 'center', margin: 12 }}>No tools yet. Add one to get started.</p>;
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#7A7A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Th>Tool</Th>
            <Th>Category</Th>
            <Th>Plan</Th>
            <Th align="right">$/user</Th>
            <Th align="right">Active</Th>
            <Th align="right">Monthly</Th>
            <Th>Renewal</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {tools.map(tool => {
            const m = deriveToolMetrics(tool, assignments, today);
            return (
              <tr
                key={tool.id}
                onClick={() => onRowClick(tool.id)}
                style={{
                  cursor: 'pointer',
                  borderTop: '1px solid #F5F0DC',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Td>
                  <div style={{ fontWeight: 600 }}>{tool.name}</div>
                  <div style={{ fontSize: 11, color: '#7A7A6E' }}>{tool.vendor}</div>
                </Td>
                <Td>{tool.category}</Td>
                <Td>{tool.plan}</Td>
                <Td align="right">{tool.costPerUserMo === 0 ? '—' : formatMoney(tool.costPerUserMo)}</Td>
                <Td align="right">{m.activeAssignments} / {tool.licensedSeats}</Td>
                <Td align="right" style={{ fontWeight: 600 }}>{formatMoney(m.monthlySpend)}</Td>
                <Td>
                  {tool.renewalDate ? (
                    <div>
                      <div>{formatDate(tool.renewalDate)}</div>
                      {m.daysUntilNotification !== null && (
                        <div style={{ fontSize: 11, color: alertColor(m.alertLevel) }}>
                          {m.daysUntilNotification < 0
                            ? `${Math.abs(m.daysUntilNotification)}d past notice`
                            : `${m.daysUntilNotification}d to notice`}
                        </div>
                      )}
                    </div>
                  ) : <span style={{ color: '#B8B8A8' }}>—</span>}
                </Td>
                <Td><AlertBadge level={tool.status === 'Active' ? m.alertLevel : 'none'} /></Td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ fontSize: 11, color: '#B8B8A8', marginTop: 8 }}>
        Click any row for full contract details.
      </p>
    </div>
  );
}

function Th({ children, align = 'left' }: { children?: React.ReactNode; align?: 'left' | 'right' }) {
  return <th style={{ padding: '8px 10px', textAlign: align, fontWeight: 600 }}>{children}</th>;
}
function Td({ children, align = 'left', style }: { children?: React.ReactNode; align?: 'left' | 'right'; style?: React.CSSProperties }) {
  return <td style={{ padding: '10px', textAlign: align, verticalAlign: 'top', ...style }}>{children}</td>;
}

// ---------- People table (cost per user) ----------
function PeopleTable({
  people,
  summary,
  onUpdate,
  onDelete,
}: {
  people: Person[];
  summary: ReturnType<typeof deriveSaaSSummary>;
  onUpdate: (p: Person) => void;
  onDelete: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (people.length === 0) {
    return <p style={{ fontSize: 13, color: '#7A7A6E', textAlign: 'center', margin: 12 }}>No users yet.</p>;
  }
  const costByPerson: Record<string, { monthly: number; annual: number; toolCount: number }> = {};
  for (const p of summary.perUserCost) costByPerson[p.person.id] = { monthly: p.monthly, annual: p.annual, toolCount: p.toolCount };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#7A7A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Department</Th>
            <Th>Title</Th>
            <Th>Status</Th>
            <Th align="right">Tools</Th>
            <Th align="right">$/mo</Th>
            <Th align="right">$/yr</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {people.map(p => {
            const cost = costByPerson[p.id] || { monthly: 0, annual: 0, toolCount: 0 };
            return (
              <tr key={p.id} style={{ borderTop: '1px solid #F5F0DC' }}>
                <Td><div style={{ fontWeight: 600 }}>{p.name}</div></Td>
                <Td>{p.email || <span style={{ color: '#B8B8A8' }}>—</span>}</Td>
                <Td>{p.department || <span style={{ color: '#B8B8A8' }}>—</span>}</Td>
                <Td>{p.jobTitle || <span style={{ color: '#B8B8A8' }}>—</span>}</Td>
                <Td>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: p.status === 'active' ? '#E8F5E9' : '#F5F5F5',
                    color: p.status === 'active' ? '#2E7D32' : '#757575',
                  }}>
                    {p.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </Td>
                <Td align="right">{cost.toolCount}</Td>
                <Td align="right" style={{ fontWeight: 600 }}>{formatMoney(cost.monthly)}</Td>
                <Td align="right">{formatMoneyCompact(cost.annual)}</Td>
                <Td align="right">
                  <button onClick={() => setEditingId(p.id)} className="btn-secondary" style={{ padding: '3px 10px', fontSize: 11, marginRight: 4 }}>Edit</button>
                  <button
                    onClick={() => { if (confirm(`Remove ${p.name}? Their assignments will also be deleted.`)) onDelete(p.id); }}
                    className="btn-danger"
                    style={{ padding: '3px 10px', fontSize: 11 }}
                  >Delete</button>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {editingId && (() => {
        const p = people.find(x => x.id === editingId);
        if (!p) return null;
        return (
          <PersonEditModal
            mode="edit"
            initial={p}
            onSave={updated => { onUpdate(updated); setEditingId(null); }}
            onClose={() => setEditingId(null)}
          />
        );
      })()}
    </div>
  );
}

// ---------- Assignments table ----------
function AssignmentsTable({
  assignments,
  tools,
  people,
  onDelete,
}: {
  assignments: SaaSAssignment[];
  tools: SaaSTool[];
  people: Person[];
  onDelete: (id: string) => void;
}) {
  if (assignments.length === 0) {
    return <p style={{ fontSize: 13, color: '#7A7A6E', textAlign: 'center', margin: 12 }}>No assignments yet.</p>;
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#7A7A6E', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Th>User</Th>
            <Th>Tool</Th>
            <Th>Date assigned</Th>
            <Th align="right">$/mo</Th>
            <Th>Notes</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {assignments.map(a => {
            const person = people.find(p => p.id === a.personId);
            const tool = tools.find(t => t.id === a.toolId);
            return (
              <tr key={a.id} style={{ borderTop: '1px solid #F5F0DC' }}>
                <Td>{person?.name || <span style={{ color: '#B8B8A8' }}>(deleted)</span>}</Td>
                <Td>{tool?.name || <span style={{ color: '#B8B8A8' }}>(deleted)</span>}</Td>
                <Td>{formatDate(a.dateAssigned)}</Td>
                <Td align="right" style={{ fontWeight: 600 }}>
                  {tool && tool.pricingModel === 'Per User' ? formatMoney(tool.costPerUserMo) : '—'}
                </Td>
                <Td>{a.notes || <span style={{ color: '#B8B8A8' }}>—</span>}</Td>
                <Td align="right">
                  <button
                    onClick={() => onDelete(a.id)}
                    className="btn-danger"
                    style={{ padding: '3px 10px', fontSize: 11 }}
                  >Remove</button>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Tool detail drawer ----------
function ToolDetailDrawer({
  tool,
  assignments,
  people,
  today,
  onClose,
  onUpdate,
  onDelete,
}: {
  tool: SaaSTool;
  assignments: SaaSAssignment[];
  people: Person[];
  today: Date;
  onClose: () => void;
  onUpdate: (t: SaaSTool) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const m = deriveToolMetrics(tool, assignments, today);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 640, width: '90%', maxHeight: '88vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {editing ? (
          <ToolEditForm
            initial={tool}
            onSave={updated => { onUpdate(updated); setEditing(false); }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#7A7A6E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {tool.category} · {tool.vendor}
                </div>
                <h3 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 700 }}>{tool.name}</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                  <AlertBadge level={tool.status === 'Active' ? m.alertLevel : 'none'} />
                  <span style={{ fontSize: 12, color: '#7A7A6E' }}>{tool.status}</span>
                </div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#7A7A6E', lineHeight: 1, padding: 0 }}>×</button>
            </div>

            {/* Spend block */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: '16px 0', padding: 12, background: '#FAFAF5', borderRadius: 8 }}>
              <DetailStat label="Monthly" value={formatMoney(m.monthlySpend)} />
              <DetailStat label="Annual"  value={formatMoneyCompact(m.annualSpend)} />
              <DetailStat label="Active assignments" value={`${m.activeAssignments} / ${tool.licensedSeats}`} />
            </div>

            {/* Renewal info */}
            <div style={{ background: alertBg(m.alertLevel), padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: alertColor(m.alertLevel), marginBottom: 4 }}>
                Renewal
              </div>
              {tool.renewalDate ? (
                <>
                  <div style={{ fontSize: 14 }}>
                    Renews <strong>{formatDate(tool.renewalDate)}</strong> · auto-renew {tool.autoRenew ? 'YES' : 'NO'} · notice period {tool.noticePeriodDays} day{tool.noticePeriodDays === 1 ? '' : 's'}
                  </div>
                  <div style={{ fontSize: 13, color: '#7A7A6E', marginTop: 4 }}>
                    Notify by <strong>{formatDate(m.notificationDueDate || '')}</strong>
                    {m.daysUntilNotification !== null && (
                      <> · <strong style={{ color: alertColor(m.alertLevel) }}>
                        {m.daysUntilNotification < 0
                          ? `${Math.abs(m.daysUntilNotification)} day${Math.abs(m.daysUntilNotification) === 1 ? '' : 's'} overdue`
                          : `${m.daysUntilNotification} day${m.daysUntilNotification === 1 ? '' : 's'} from today`}
                      </strong></>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: '#7A7A6E' }}>No renewal date set.</div>
              )}
            </div>

            {/* Detail grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <DetailField label="Plan / Tier"   value={tool.plan} />
              <DetailField label="Pricing model" value={tool.pricingModel} />
              <DetailField label="Cost / user / mo" value={tool.costPerUserMo === 0 ? 'Free' : formatMoney(tool.costPerUserMo)} />
              <DetailField label="Licensed seats" value={String(tool.licensedSeats)} />
              <DetailField label="Billing cycle"  value={tool.billingCycle} />
              <DetailField label="Payment method" value={tool.paymentMethod} />
              <DetailField label="Internal owner" value={tool.internalOwner} />
              <DetailField label="Contract start" value={formatDate(tool.contractStart)} />
              <DetailField label="Vendor contact" value={tool.vendorContact} />
              <DetailField label="Vendor email"   value={tool.vendorEmail} />
            </div>

            {tool.notes && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#7A7A6E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Notes</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, padding: 10, background: '#FAFAF5', borderRadius: 6, whiteSpace: 'pre-wrap' }}>{tool.notes}</div>
              </div>
            )}

            {/* Assigned users */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#7A7A6E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                Assigned users ({assignments.length})
              </div>
              {assignments.length === 0 ? (
                <div style={{ fontSize: 13, color: '#B8B8A8' }}>No users assigned.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {assignments.map(a => {
                    const p = people.find(pp => pp.id === a.personId);
                    return (
                      <div key={a.id} style={{ fontSize: 13, padding: '6px 10px', background: '#FAFAF5', borderRadius: 6 }}>
                        <span style={{ fontWeight: 600 }}>{p?.name || '(deleted user)'}</span>
                        <span style={{ color: '#7A7A6E' }}> · since {formatDate(a.dateAssigned)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <button onClick={() => { if (confirm(`Delete ${tool.name}? This will also remove all of its assignments.`)) onDelete(); }} className="btn-danger">Delete tool</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={onClose} className="btn-secondary">Close</button>
                <button onClick={() => setEditing(true)} className="btn-primary">Edit</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#7A7A6E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{value}</div>
    </div>
  );
}
function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#7A7A6E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 13, marginTop: 2 }}>{value || <span style={{ color: '#B8B8A8' }}>—</span>}</div>
    </div>
  );
}

// ---------- Tool edit modal (shell that wraps the form) ----------
function ToolEditModal({
  mode,
  initial,
  onSave,
  onClose,
}: {
  mode: 'add' | 'edit';
  initial?: SaaSTool;
  onSave: (t: SaaSTool) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 640, width: '90%', maxHeight: '88vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <ToolEditForm
          initial={initial}
          onSave={t => { onSave(t); }}
          onCancel={onClose}
          title={mode === 'add' ? 'Add tool' : 'Edit tool'}
        />
      </div>
    </div>
  );
}

function ToolEditForm({
  initial,
  onSave,
  onCancel,
  title,
}: {
  initial?: SaaSTool;
  onSave: (t: SaaSTool) => void;
  onCancel: () => void;
  title?: string;
}) {
  const [t, setT] = useState<SaaSTool>(initial || {
    id: generateId(),
    name: '',
    category: 'Productivity',
    vendor: '',
    plan: '',
    pricingModel: 'Per User',
    costPerUserMo: 0,
    licensedSeats: 1,
    billingCycle: 'Monthly',
    paymentMethod: '',
    internalOwner: '',
    vendorContact: '',
    vendorEmail: '',
    contractStart: '',
    renewalDate: '',
    autoRenew: true,
    noticePeriodDays: 30,
    status: 'Active',
    notes: '',
  });

  function set<K extends keyof SaaSTool>(key: K, value: SaaSTool[K]) {
    setT(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>{title || 'Edit tool'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Name *">
          <input value={t.name} onChange={e => set('name', e.target.value)} autoFocus />
        </Field>
        <Field label="Vendor">
          <input value={t.vendor} onChange={e => set('vendor', e.target.value)} />
        </Field>
        <Field label="Category">
          <select value={t.category} onChange={e => set('category', e.target.value as ToolCategory)}>
            {TOOL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Plan / Tier">
          <input value={t.plan} onChange={e => set('plan', e.target.value)} />
        </Field>
        <Field label="Pricing model">
          <select value={t.pricingModel} onChange={e => set('pricingModel', e.target.value as SaaSTool['pricingModel'])}>
            {PRICING_MODELS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label={t.pricingModel === 'Per User' ? 'Cost / user / month ($)' : 'Cost / month ($)'}>
          <input
            type="number"
            min={0}
            step="0.01"
            value={t.costPerUserMo}
            onChange={e => set('costPerUserMo', parseFloat(e.target.value) || 0)}
          />
        </Field>
        <Field label="Licensed seats">
          <input type="number" min={0} value={t.licensedSeats} onChange={e => set('licensedSeats', parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Billing cycle">
          <select value={t.billingCycle} onChange={e => set('billingCycle', e.target.value as SaaSTool['billingCycle'])}>
            {BILLING_CYCLES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select value={t.status} onChange={e => set('status', e.target.value as SaaSTool['status'])}>
            {TOOL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Internal owner">
          <input value={t.internalOwner} onChange={e => set('internalOwner', e.target.value)} />
        </Field>
        <Field label="Contract start">
          <input type="date" value={t.contractStart} onChange={e => set('contractStart', e.target.value)} />
        </Field>
        <Field label="Renewal date">
          <input type="date" value={t.renewalDate} onChange={e => set('renewalDate', e.target.value)} />
        </Field>
        <Field label="Notice period (days)">
          <input type="number" min={0} value={t.noticePeriodDays} onChange={e => set('noticePeriodDays', parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Auto-renew">
          <select value={t.autoRenew ? 'yes' : 'no'} onChange={e => set('autoRenew', e.target.value === 'yes')}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </Field>
        <Field label="Payment method">
          <input value={t.paymentMethod} onChange={e => set('paymentMethod', e.target.value)} placeholder="e.g. Mercury MC ••2483" />
        </Field>
        <Field label="Vendor contact">
          <input value={t.vendorContact} onChange={e => set('vendorContact', e.target.value)} />
        </Field>
        <Field label="Vendor email">
          <input type="email" value={t.vendorEmail} onChange={e => set('vendorEmail', e.target.value)} />
        </Field>
      </div>
      <Field label="Notes">
        <textarea value={t.notes} onChange={e => set('notes', e.target.value)} rows={3} style={{ width: '100%', resize: 'vertical' }} />
      </Field>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
        <button
          onClick={() => { if (!t.name.trim()) return; onSave(t); }}
          className="btn-primary"
        >Save</button>
      </div>
    </div>
  );
}

// ---------- Person edit modal ----------
function PersonEditModal({
  mode,
  initial,
  onSave,
  onClose,
}: {
  mode: 'add' | 'edit';
  initial?: Person;
  onSave: (p: Person) => void;
  onClose: () => void;
}) {
  const [p, setP] = useState<Person>(initial || {
    id: generateId(),
    name: '',
    email: '',
    department: '',
    jobTitle: '',
    status: 'active',
    notes: '',
  });
  function set<K extends keyof Person>(key: K, value: Person[K]) {
    setP(prev => ({ ...prev, [key]: value }));
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>{mode === 'add' ? 'Add user' : 'Edit user'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Full name *">
            <input value={p.name} onChange={e => set('name', e.target.value)} autoFocus />
          </Field>
          <Field label="Email">
            <input type="email" value={p.email} onChange={e => set('email', e.target.value)} />
          </Field>
          <Field label="Department">
            <input value={p.department} onChange={e => set('department', e.target.value)} />
          </Field>
          <Field label="Job title">
            <input value={p.jobTitle} onChange={e => set('jobTitle', e.target.value)} />
          </Field>
          <Field label="Status">
            <select value={p.status} onChange={e => set('status', e.target.value as Person['status'])}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
        </div>
        <Field label="Notes">
          <textarea value={p.notes} onChange={e => set('notes', e.target.value)} rows={2} style={{ width: '100%', resize: 'vertical' }} />
        </Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={() => { if (!p.name.trim()) return; onSave(p); }}
            className="btn-primary"
          >Save</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Add assignment modal ----------
function AssignmentAddModal({
  tools,
  people,
  existingAssignments,
  onSave,
  onClose,
}: {
  tools: SaaSTool[];
  people: Person[];
  existingAssignments: SaaSAssignment[];
  onSave: (a: SaaSAssignment) => void;
  onClose: () => void;
}) {
  const [personId, setPersonId] = useState(people[0]?.id || '');
  const [toolId, setToolId] = useState(tools[0]?.id || '');
  const [dateAssigned, setDateAssigned] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const duplicate = existingAssignments.some(a => a.personId === personId && a.toolId === toolId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>Assign tool to user</h3>
        {(people.length === 0 || tools.length === 0) ? (
          <p style={{ fontSize: 13, color: '#7A7A6E' }}>
            You need at least one user and one tool before creating an assignment.
          </p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="User">
                <select value={personId} onChange={e => setPersonId(e.target.value)}>
                  {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              <Field label="Tool">
                <select value={toolId} onChange={e => setToolId(e.target.value)}>
                  {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>
              <Field label="Date assigned">
                <input type="date" value={dateAssigned} onChange={e => setDateAssigned(e.target.value)} />
              </Field>
            </div>
            <Field label="Notes">
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ width: '100%', resize: 'vertical' }} />
            </Field>
            {duplicate && (
              <p style={{ fontSize: 12, color: '#C62828', marginTop: 4 }}>
                This user already has this tool assigned.
              </p>
            )}
          </>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            disabled={!personId || !toolId || duplicate}
            onClick={() => onSave({ id: generateId(), personId, toolId, dateAssigned, notes })}
            className="btn-primary"
            style={{ opacity: !personId || !toolId || duplicate ? 0.5 : 1 }}
          >Assign</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Field wrapper ----------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
