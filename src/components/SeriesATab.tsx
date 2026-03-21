'use client';

import { useState } from 'react';
import { SeriesAData, VCContact, TeamMilestone, TractionMilestone } from '../lib/types';
import { generateId } from '../lib/storage';

interface SeriesATabProps {
  data: SeriesAData;
  onUpdate: (data: SeriesAData) => void;
}

const teamStatusLabels: Record<string, string> = {
  'open': 'Open',
  'interviewing': 'Interviewing',
  'offer': 'Offer Out',
  'filled': 'Filled',
};

const teamStatusColors: Record<string, string> = {
  'open': '#B8B8A8',
  'interviewing': '#D4883A',
  'offer': '#3A7CA5',
  'filled': '#2E7D32',
};

const tractionStatusLabels: Record<string, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  'achieved': 'Achieved',
};

const tractionStatusColors: Record<string, string> = {
  'not-started': '#B8B8A8',
  'in-progress': '#D4883A',
  'achieved': '#2E7D32',
};

export default function SeriesATab({ data, onUpdate }: SeriesATabProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1A1A1A' }}>Series A Milestones</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7A7A6E' }}>
            Track team hiring, traction goals &amp; VC pipeline toward your raise
          </p>
        </div>
      </div>

      {/* Overview Card */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Target Raise
          </div>
          {editingSection === 'overview' ? (
            <input
              value={data.targetRaiseAmount}
              onChange={e => onUpdate({ ...data, targetRaiseAmount: e.target.value })}
              style={{ fontSize: 20, fontWeight: 700, padding: '4px 8px', width: 140 }}
            />
          ) : (
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A' }}>{data.targetRaiseAmount}</div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Target Timeline
          </div>
          {editingSection === 'overview' ? (
            <input
              value={data.targetTimeline}
              onChange={e => onUpdate({ ...data, targetTimeline: e.target.value })}
              style={{ fontSize: 20, fontWeight: 700, padding: '4px 8px', width: 140 }}
            />
          ) : (
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A' }}>{data.targetTimeline}</div>
          )}
        </div>
        <div style={{ flex: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Notes
          </div>
          {editingSection === 'overview' ? (
            <textarea
              value={data.notes}
              onChange={e => onUpdate({ ...data, notes: e.target.value })}
              rows={2}
              style={{ fontSize: 13, padding: '4px 8px' }}
            />
          ) : (
            <div style={{ fontSize: 13, color: '#1A1A1A' }}>{data.notes || 'No notes yet'}</div>
          )}
        </div>
        <button
          onClick={() => setEditingSection(editingSection === 'overview' ? null : 'overview')}
          className="btn-secondary"
          style={{ padding: '4px 12px', fontSize: 12, alignSelf: 'flex-start' }}
        >
          {editingSection === 'overview' ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* Team Plan — above VC Pipeline */}
      <TeamPlanCard
        roles={data.teamPlan}
        onUpdate={teamPlan => onUpdate({ ...data, teamPlan })}
      />

      {/* Traction Goals */}
      <TractionCard
        goals={data.tractionGoals}
        onUpdate={tractionGoals => onUpdate({ ...data, tractionGoals })}
      />

      {/* VC Pipeline */}
      <VCPipelineCard
        contacts={data.vcPipeline}
        onUpdate={vcPipeline => onUpdate({ ...data, vcPipeline })}
      />
    </div>
  );
}

/* ===================== TEAM PLAN ===================== */
function TeamPlanCard({ roles, onUpdate }: { roles: TeamMilestone[]; onUpdate: (r: TeamMilestone[]) => void }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(roles);

  function startEdit() { setEditData(roles); setEditing(true); }
  function save() { onUpdate(editData); setEditing(false); }
  function cancel() { setEditing(false); }

  function addRole() {
    setEditData([...editData, { id: generateId(), role: '', status: 'open', targetDate: '', notes: '' }]);
  }

  if (editing) {
    return (
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Team Hiring Plan</h3>
          <button onClick={addRole} className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}>+ Add Role</button>
        </div>
        {editData.map((r, idx) => (
          <div key={r.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input value={r.role} onChange={e => { const u = [...editData]; u[idx] = { ...r, role: e.target.value }; setEditData(u); }} placeholder="Role title" style={{ flex: 2 }} />
            <select value={r.status} onChange={e => { const u = [...editData]; u[idx] = { ...r, status: e.target.value as TeamMilestone['status'] }; setEditData(u); }} style={{ flex: 1 }}>
              <option value="open">Open</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer Out</option>
              <option value="filled">Filled</option>
            </select>
            <input type="date" value={r.targetDate} onChange={e => { const u = [...editData]; u[idx] = { ...r, targetDate: e.target.value }; setEditData(u); }} style={{ flex: 1 }} />
            <input value={r.notes} onChange={e => { const u = [...editData]; u[idx] = { ...r, notes: e.target.value }; setEditData(u); }} placeholder="Notes" style={{ flex: 2 }} />
            <button onClick={() => setEditData(editData.filter(x => x.id !== r.id))} style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: 16 }}>x</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={cancel} className="btn-secondary">Cancel</button>
          <button onClick={save} className="btn-primary">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Team Hiring Plan</h3>
        <button onClick={startEdit} className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}>Edit</button>
      </div>
      {roles.length === 0 ? (
        <p style={{ fontSize: 13, color: '#7A7A6E', textAlign: 'center' }}>No roles planned yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {roles.map(r => (
            <div key={r.id} style={{ background: '#FAFAF5', border: '1px solid #F5F0DC', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{r.role}</span>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, color: 'white', background: teamStatusColors[r.status] }}>
                  {teamStatusLabels[r.status]}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#7A7A6E' }}>
                {r.targetDate ? `Target: ${new Date(r.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'No target date'}
              </div>
              {r.notes && <div style={{ fontSize: 12, color: '#7A7A6E', marginTop: 4 }}>{r.notes}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===================== TRACTION GOALS ===================== */
function TractionCard({ goals, onUpdate }: { goals: TractionMilestone[]; onUpdate: (g: TractionMilestone[]) => void }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(goals);

  function startEdit() { setEditData(goals); setEditing(true); }
  function save() { onUpdate(editData); setEditing(false); }
  function cancel() { setEditing(false); }

  function addGoal() {
    setEditData([...editData, { id: generateId(), milestone: '', target: '', current: '', status: 'not-started', notes: '' }]);
  }

  if (editing) {
    return (
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Traction Goals</h3>
          <button onClick={addGoal} className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}>+ Add Goal</button>
        </div>
        {editData.map((g, idx) => (
          <div key={g.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input value={g.milestone} onChange={e => { const u = [...editData]; u[idx] = { ...g, milestone: e.target.value }; setEditData(u); }} placeholder="Milestone" style={{ flex: 2 }} />
            <input value={g.target} onChange={e => { const u = [...editData]; u[idx] = { ...g, target: e.target.value }; setEditData(u); }} placeholder="Target" style={{ flex: 1 }} />
            <input value={g.current} onChange={e => { const u = [...editData]; u[idx] = { ...g, current: e.target.value }; setEditData(u); }} placeholder="Current" style={{ flex: 1 }} />
            <select value={g.status} onChange={e => { const u = [...editData]; u[idx] = { ...g, status: e.target.value as TractionMilestone['status'] }; setEditData(u); }} style={{ flex: 1 }}>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="achieved">Achieved</option>
            </select>
            <input value={g.notes} onChange={e => { const u = [...editData]; u[idx] = { ...g, notes: e.target.value }; setEditData(u); }} placeholder="Notes" style={{ flex: 2 }} />
            <button onClick={() => setEditData(editData.filter(x => x.id !== g.id))} style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: 16 }}>x</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={cancel} className="btn-secondary">Cancel</button>
          <button onClick={save} className="btn-primary">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Traction Goals</h3>
        <button onClick={startEdit} className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}>Edit</button>
      </div>
      {goals.length === 0 ? (
        <p style={{ fontSize: 13, color: '#7A7A6E', textAlign: 'center' }}>No traction goals yet.</p>
      ) : (
        <div style={{ border: '1px solid #F5F0DC', borderRadius: 6, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F5F0DC' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Milestone</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Target</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Current</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Progress</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Status</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {goals.map(g => {
                const targetNum = parseFloat(g.target.replace(/[^0-9.]/g, ''));
                const currentNum = parseFloat(g.current.replace(/[^0-9.]/g, ''));
                const pct = targetNum > 0 && !isNaN(currentNum) ? Math.min(100, Math.round((currentNum / targetNum) * 100)) : 0;
                return (
                  <tr key={g.id} style={{ borderTop: '1px solid #F5F0DC' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 500 }}>{g.milestone}</td>
                    <td style={{ padding: '8px 12px' }}>{g.target}</td>
                    <td style={{ padding: '8px 12px' }}>{g.current}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ height: 6, flex: 1, background: '#F5F0DC', borderRadius: 3, overflow: 'hidden', maxWidth: 80 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#2E7D32' : pct >= 50 ? '#D4883A' : '#C62828', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#7A7A6E' }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, color: 'white', background: tractionStatusColors[g.status] }}>
                        {tractionStatusLabels[g.status]}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', fontSize: 12, color: '#7A7A6E' }}>{g.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ===================== VC PIPELINE ===================== */

const emptyVC: Omit<VCContact, 'id'> = {
  fundName: '', aliveOrDead: 'Alive', wave: '', contactName: '',
  stageOfConversation: '', sentiment: '', conversationNotes: '',
  ejfConnection: '', optimistConnection: '', runyonConnection: '',
  connectedBy: '', dataRoom: '', customerCalls: '', insurtechFintechInvestments: '',
};

const vcColumns: { key: keyof VCContact; label: string; width?: number }[] = [
  { key: 'fundName', label: 'Fund Name', width: 180 },
  { key: 'aliveOrDead', label: 'Alive/Dead', width: 80 },
  { key: 'wave', label: 'Wave', width: 60 },
  { key: 'contactName', label: 'Contact Name', width: 150 },
  { key: 'stageOfConversation', label: 'Stage', width: 120 },
  { key: 'sentiment', label: 'Sentiment', width: 90 },
  { key: 'conversationNotes', label: 'Conversation Notes', width: 180 },
  { key: 'ejfConnection', label: 'EJF Connection', width: 120 },
  { key: 'optimistConnection', label: 'Optimist Connection', width: 120 },
  { key: 'runyonConnection', label: 'Runyon Connection', width: 120 },
  { key: 'connectedBy', label: 'Connected By', width: 100 },
  { key: 'dataRoom', label: 'Data Room', width: 80 },
  { key: 'customerCalls', label: 'Customer Calls', width: 100 },
  { key: 'insurtechFintechInvestments', label: 'Insurtech/Fintech Investments', width: 160 },
];

function VCPipelineCard({ contacts, onUpdate }: { contacts: VCContact[]; onUpdate: (c: VCContact[]) => void }) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(contacts);
  const [filter, setFilter] = useState<'all' | 'Alive' | 'Dead'>('all');

  function startEdit() { setEditData(contacts); setEditing(true); }
  function save() { onUpdate(editData); setEditing(false); }
  function cancel() { setEditing(false); }

  function addContact() {
    setEditData([...editData, { id: generateId(), ...emptyVC }]);
  }

  function moveVC(idx: number, direction: 'up' | 'down') {
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= editData.length) return;
    const u = [...editData];
    [u[idx], u[newIdx]] = [u[newIdx], u[idx]];
    setEditData(u);
  }

  const aliveCount = contacts.filter(c => c.aliveOrDead === 'Alive').length;
  const deadCount = contacts.filter(c => c.aliveOrDead === 'Dead').length;

  function sortByWave(list: VCContact[]) {
    return [...list].sort((a, b) => {
      const waveA = a.wave.trim();
      const waveB = b.wave.trim();
      // Blank goes last
      if (!waveA && !waveB) return 0;
      if (!waveA) return 1;
      if (!waveB) return -1;
      // Numeric sort: 0, 1, 2, 3...
      return parseFloat(waveA) - parseFloat(waveB);
    });
  }

  const filtered = sortByWave(filter === 'all' ? contacts : contacts.filter(c => c.aliveOrDead === filter));

  function updateField(idx: number, key: keyof VCContact, value: string) {
    const u = [...editData];
    u[idx] = { ...u[idx], [key]: value };
    setEditData(u);
  }

  if (editing) {
    return (
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>VC Pipeline</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addContact} className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}>+ Add VC</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 12, minWidth: 1600 }}>
            <thead>
              <tr style={{ background: '#F5F0DC' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: 11 }}>#</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, fontSize: 11, width: 50 }}>Move</th>
                {vcColumns.map(col => (
                  <th key={col.key} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: 11, minWidth: col.width }}>
                    {col.label}
                  </th>
                ))}
                <th style={{ padding: '6px 8px', width: 30 }}></th>
              </tr>
            </thead>
            <tbody>
              {editData.map((c, idx) => (
                <tr key={c.id} style={{ borderTop: '1px solid #F5F0DC' }}>
                  <td style={{ padding: '4px 8px', color: '#7A7A6E', fontSize: 11 }}>{idx + 1}</td>
                  <td style={{ padding: '2px 4px', textAlign: 'center' }}>
                    <button
                      onClick={() => moveVC(idx, 'up')}
                      disabled={idx === 0}
                      style={{
                        background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer',
                        fontSize: 11, color: idx === 0 ? '#D4CFC0' : '#1A1A1A', padding: '0 2px',
                      }}
                    >▲</button>
                    <button
                      onClick={() => moveVC(idx, 'down')}
                      disabled={idx === editData.length - 1}
                      style={{
                        background: 'none', border: 'none', cursor: idx === editData.length - 1 ? 'default' : 'pointer',
                        fontSize: 11, color: idx === editData.length - 1 ? '#D4CFC0' : '#1A1A1A', padding: '0 2px',
                      }}
                    >▼</button>
                  </td>
                  {vcColumns.map(col => (
                    <td key={col.key} style={{ padding: '2px 4px' }}>
                      {col.key === 'aliveOrDead' ? (
                        <select
                          value={c[col.key]}
                          onChange={e => updateField(idx, col.key, e.target.value)}
                          style={{ fontSize: 11, padding: '2px 4px', width: '100%' }}
                        >
                          <option value="Alive">Alive</option>
                          <option value="Dead">Dead</option>
                          <option value="">—</option>
                        </select>
                      ) : (
                        <input
                          value={c[col.key]}
                          onChange={e => updateField(idx, col.key, e.target.value)}
                          style={{ fontSize: 11, padding: '2px 6px', width: '100%' }}
                        />
                      )}
                    </td>
                  ))}
                  <td style={{ padding: '2px 4px' }}>
                    <button
                      onClick={() => setEditData(editData.filter(x => x.id !== c.id))}
                      style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: 14 }}
                    >
                      x
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={cancel} className="btn-secondary">Cancel</button>
          <button onClick={save} className="btn-primary">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>VC Pipeline ({contacts.length})</h3>
        <button onClick={startEdit} className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}>Edit</button>
      </div>

      {/* Summary badges and filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => setFilter('all')} style={{
          padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, cursor: 'pointer',
          border: filter === 'all' ? '2px solid #2D5A3D' : '1px solid #D4C98A',
          background: filter === 'all' ? '#2D5A3D' : 'transparent',
          color: filter === 'all' ? 'white' : '#1A1A1A',
        }}>
          All: {contacts.length}
        </button>
        <button onClick={() => setFilter('Alive')} style={{
          padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, cursor: 'pointer',
          border: filter === 'Alive' ? '2px solid #2E7D32' : '1px solid #D4C98A',
          background: filter === 'Alive' ? '#2E7D32' : 'transparent',
          color: filter === 'Alive' ? 'white' : '#1A1A1A',
        }}>
          Alive: {aliveCount}
        </button>
        <button onClick={() => setFilter('Dead')} style={{
          padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, cursor: 'pointer',
          border: filter === 'Dead' ? '2px solid #C62828' : '1px solid #D4C98A',
          background: filter === 'Dead' ? '#C62828' : 'transparent',
          color: filter === 'Dead' ? 'white' : '#1A1A1A',
        }}>
          Dead: {deadCount}
        </button>
      </div>

      {filtered.length === 0 ? (
        <p style={{ fontSize: 13, color: '#7A7A6E', textAlign: 'center' }}>No VCs in pipeline yet.</p>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #F5F0DC', borderRadius: 6 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 1400 }}>
            <thead>
              <tr style={{ background: '#F5F0DC' }}>
                {vcColumns.map(col => (
                  <th key={col.key} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderTop: '1px solid #F5F0DC' }}>
                  {vcColumns.map(col => {
                    const val = c[col.key];
                    if (col.key === 'aliveOrDead') {
                      return (
                        <td key={col.key} style={{ padding: '6px 10px' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: 12,
                            fontSize: 10, fontWeight: 600, color: 'white',
                            background: val === 'Alive' ? '#2E7D32' : val === 'Dead' ? '#C62828' : '#B8B8A8',
                          }}>
                            {val || '—'}
                          </span>
                        </td>
                      );
                    }
                    if (col.key === 'fundName') {
                      return <td key={col.key} style={{ padding: '6px 10px', fontWeight: 500 }}>{val || '—'}</td>;
                    }
                    return <td key={col.key} style={{ padding: '6px 10px', color: val ? '#1A1A1A' : '#B8B8A8' }}>{val || '—'}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
