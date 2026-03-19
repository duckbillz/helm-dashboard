'use client';

import { useState } from 'react';
import { Objective, OKRStatus } from '../lib/types';
import { generateId } from '../lib/storage';
import { formatMonth, getCurrentMonth } from '../lib/helpers';
import OKRCard from './OKRCard';

interface OKRsTabProps {
  objectives: Objective[];
  onUpdate: (objectives: Objective[]) => void;
  teamMembers: string[];
}

export default function OKRsTab({ objectives, onUpdate, teamMembers }: OKRsTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [reordering, setReordering] = useState(false);

  // Get unique months
  const months = [...new Set(objectives.map(o => o.month))].sort();

  const filtered = objectives
    .filter(o => {
      if (filterMonth !== 'all' && o.month !== filterMonth) return false;
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  function handleUpdateObjective(updated: Objective) {
    onUpdate(objectives.map(o => o.id === updated.id ? updated : o));
  }

  function handleDeleteObjective(id: string) {
    onUpdate(objectives.filter(o => o.id !== id));
  }

  function moveObjective(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= objectives.length) return;
    const updated = [...objectives];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onUpdate(updated);
  }

  function handleAddObjective(obj: Objective) {
    onUpdate([obj, ...objectives]);
    setShowAddModal(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1A1A1A' }}>Company OKRs</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7A7A6E' }}>
            Monthly objectives &amp; key results — scored 1 to 10
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setReordering(!reordering)}
            className={reordering ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 14, padding: '10px 20px' }}
          >
            {reordering ? 'Done Reordering' : 'Reorder'}
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ fontSize: 14, padding: '10px 20px' }}>
            + New Objective
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          style={{ width: 180, fontSize: 13, padding: '6px 10px' }}
        >
          <option value="all">All Months</option>
          {months.map(m => (
            <option key={m} value={m}>{formatMonth(m)}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ width: 160, fontSize: 13, padding: '6px 10px' }}
        >
          <option value="all">All Statuses</option>
          <option value="on-track">On Track</option>
          <option value="at-risk">At Risk</option>
          <option value="behind">Behind</option>
          <option value="not-started">Not Started</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ fontSize: 15, color: '#7A7A6E', margin: 0 }}>
            No objectives found. Create your first OKR to get started.
          </p>
        </div>
      ) : (
        filtered.map((obj, idx) => {
          const globalIdx = objectives.findIndex(o => o.id === obj.id);
          return (
            <div key={obj.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              {reordering && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 16 }}>
                  <button
                    onClick={() => moveObjective(globalIdx, 'up')}
                    disabled={globalIdx === 0}
                    style={{
                      width: 28, height: 28, borderRadius: 6, border: '1px solid #D4CFC0',
                      background: globalIdx === 0 ? '#F5F0DC' : '#FFFFFF', cursor: globalIdx === 0 ? 'default' : 'pointer',
                      fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: globalIdx === 0 ? '#B8B8A8' : '#1A1A1A', opacity: globalIdx === 0 ? 0.5 : 1,
                    }}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveObjective(globalIdx, 'down')}
                    disabled={globalIdx === objectives.length - 1}
                    style={{
                      width: 28, height: 28, borderRadius: 6, border: '1px solid #D4CFC0',
                      background: globalIdx === objectives.length - 1 ? '#F5F0DC' : '#FFFFFF', cursor: globalIdx === objectives.length - 1 ? 'default' : 'pointer',
                      fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: globalIdx === objectives.length - 1 ? '#B8B8A8' : '#1A1A1A', opacity: globalIdx === objectives.length - 1 ? 0.5 : 1,
                    }}
                  >
                    ▼
                  </button>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <OKRCard
                  objective={obj}
                  onUpdate={handleUpdateObjective}
                  onDelete={handleDeleteObjective}
                  teamMembers={teamMembers}
                />
              </div>
            </div>
          );
        })
      )}

      {showAddModal && (
        <AddObjectiveModal
          onAdd={handleAddObjective}
          onClose={() => setShowAddModal(false)}
          teamMembers={teamMembers}
        />
      )}
    </div>
  );
}

function AddObjectiveModal({
  onAdd,
  onClose,
  teamMembers,
}: {
  onAdd: (obj: Objective) => void;
  onClose: () => void;
  teamMembers: string[];
}) {
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState(teamMembers[0] || '');
  const [month, setMonth] = useState(getCurrentMonth());
  const [status, setStatus] = useState<OKRStatus>('not-started');
  const [keyResults, setKeyResults] = useState([
    { id: generateId(), title: '', score: 1, notes: '' },
  ]);

  function handleSubmit() {
    if (!title.trim()) return;
    onAdd({
      id: generateId(),
      title,
      owner,
      status,
      month,
      keyResults: keyResults.filter(kr => kr.title.trim()),
      comments: [],
    });
  }

  function addKR() {
    setKeyResults([...keyResults, { id: generateId(), title: '', score: 1, notes: '' }]);
  }

  function updateKR(id: string, field: string, value: string | number) {
    setKeyResults(keyResults.map(kr => kr.id === id ? { ...kr, [field]: value } : kr));
  }

  function removeKR(id: string) {
    setKeyResults(keyResults.filter(kr => kr.id !== id));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600 }}>New Objective</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Objective Title
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              style={{ marginTop: 4 }}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner</label>
              <select value={owner} onChange={e => setOwner(e.target.value)} style={{ marginTop: 4 }}>
                {teamMembers.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as OKRStatus)} style={{ marginTop: 4 }}>
                <option value="not-started">Not Started</option>
                <option value="on-track">On Track</option>
                <option value="at-risk">At Risk</option>
                <option value="behind">Behind</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Month</label>
              <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ marginTop: 4 }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Key Results
              </label>
              <button onClick={addKR} className="btn-secondary" style={{ padding: '2px 10px', fontSize: 12 }}>
                + Add
              </button>
            </div>
            {keyResults.map((kr, idx) => (
              <div key={kr.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#7A7A6E', fontWeight: 600 }}>{idx + 1}.</span>
                <input
                  value={kr.title}
                  onChange={e => updateKR(kr.id, 'title', e.target.value)}
                  placeholder="Key result..."
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => removeKR(kr.id)}
                  style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: 16 }}
                >
                  x
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary">Create Objective</button>
          </div>
        </div>
      </div>
    </div>
  );
}
