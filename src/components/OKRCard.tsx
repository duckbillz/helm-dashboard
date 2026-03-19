'use client';

import { useState } from 'react';
import { Objective, KeyResult, Comment, OKRStatus } from '../lib/types';
import { getAverageScore, getScoreClass, getStatusLabel, formatMonth } from '../lib/helpers';
import { generateId } from '../lib/storage';
import CommentThread from './CommentThread';

interface OKRCardProps {
  objective: Objective;
  onUpdate: (updated: Objective) => void;
  onDelete: (id: string) => void;
  teamMembers: string[];
}

export default function OKRCard({ objective, onUpdate, onDelete, teamMembers }: OKRCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editData, setEditData] = useState<Objective>(objective);

  const avgScore = getAverageScore(objective.keyResults);
  const scoreClass = getScoreClass(avgScore);

  function handleSave() {
    onUpdate(editData);
    setIsEditing(false);
  }

  function handleCancel() {
    setEditData(objective);
    setIsEditing(false);
  }

  function handleKeyResultChange(krId: string, field: keyof KeyResult, value: string | number) {
    setEditData({
      ...editData,
      keyResults: editData.keyResults.map(kr =>
        kr.id === krId ? { ...kr, [field]: value } : kr
      ),
    });
  }

  function addKeyResult() {
    setEditData({
      ...editData,
      keyResults: [
        ...editData.keyResults,
        { id: generateId(), title: '', score: 1, notes: '' },
      ],
    });
  }

  function removeKeyResult(krId: string) {
    setEditData({
      ...editData,
      keyResults: editData.keyResults.filter(kr => kr.id !== krId),
    });
  }

  function addComment(text: string, author: string) {
    const newComment: Comment = {
      id: generateId(),
      author,
      text,
      timestamp: new Date().toISOString(),
      replies: [],
    };
    onUpdate({
      ...objective,
      comments: [...objective.comments, newComment],
    });
  }

  function addReply(commentId: string, text: string, author: string) {
    const reply: Comment = {
      id: generateId(),
      author,
      text,
      timestamp: new Date().toISOString(),
      replies: [],
    };
    const updatedComments = objective.comments.map(c =>
      c.id === commentId
        ? { ...c, replies: [...c.replies, reply] }
        : c
    );
    onUpdate({ ...objective, comments: updatedComments });
  }

  if (isEditing) {
    return (
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Objective
            </label>
            <input
              value={editData.title}
              onChange={e => setEditData({ ...editData, title: e.target.value })}
              style={{ marginTop: 4 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Owner
              </label>
              <select
                value={editData.owner}
                onChange={e => setEditData({ ...editData, owner: e.target.value })}
                style={{ marginTop: 4 }}
              >
                {teamMembers.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Status
              </label>
              <select
                value={editData.status}
                onChange={e => setEditData({ ...editData, status: e.target.value as OKRStatus })}
                style={{ marginTop: 4 }}
              >
                <option value="not-started">Not Started</option>
                <option value="on-track">On Track</option>
                <option value="at-risk">At Risk</option>
                <option value="behind">Behind</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Month
              </label>
              <input
                type="month"
                value={editData.month}
                onChange={e => setEditData({ ...editData, month: e.target.value })}
                style={{ marginTop: 4 }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Key Results
              </label>
              <button onClick={addKeyResult} className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}>
                + Add Key Result
              </button>
            </div>
            {editData.keyResults.map((kr, idx) => (
              <div key={kr.id} style={{ padding: 12, background: '#F5F0DC', borderRadius: 6, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#7A7A6E', fontWeight: 600, minWidth: 20 }}>
                    {idx + 1}.
                  </span>
                  <input
                    value={kr.title}
                    onChange={e => handleKeyResultChange(kr.id, 'title', e.target.value)}
                    placeholder="Key result description..."
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={() => removeKeyResult(kr.id)}
                    style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}
                  >
                    x
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 28 }}>
                  <span style={{ fontSize: 12, color: '#7A7A6E', minWidth: 40 }}>
                    Score: {kr.score}/10
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={kr.score}
                    onChange={e => handleKeyResultChange(kr.id, 'score', parseInt(e.target.value))}
                    style={{ flex: 1, maxWidth: 200 }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={handleCancel} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{objective.title}</h3>
            <span
              className={`status-${objective.status}`}
              style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 500 }}
            >
              {getStatusLabel(objective.status)}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#7A7A6E' }}>
            {objective.owner} &middot; {formatMonth(objective.month)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            className={scoreClass}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 18,
              minWidth: 50,
              textAlign: 'center',
            }}
          >
            {avgScore}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        {objective.keyResults.map((kr, idx) => (
          <div
            key={kr.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: idx < objective.keyResults.length - 1 ? '1px solid #F5F0DC' : 'none',
            }}
          >
            <span style={{ fontSize: 13, color: '#7A7A6E', minWidth: 24 }}>{idx + 1}.</span>
            <span style={{ flex: 1, fontSize: 14 }}>{kr.title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
              <div
                style={{
                  height: 6,
                  flex: 1,
                  background: '#F5F0DC',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(kr.score / 10) * 100}%`,
                    background: kr.score >= 7 ? '#2E7D32' : kr.score >= 4 ? '#F57F17' : '#C62828',
                    borderRadius: 3,
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#7A7A6E', minWidth: 28, textAlign: 'right' }}>
                {kr.score}/10
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowComments(!showComments)}
            className="btn-secondary"
            style={{ padding: '4px 12px', fontSize: 12 }}
          >
            {showComments ? 'Hide' : 'Comments'} ({objective.comments.length})
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setEditData(objective); setIsEditing(true); }}
            className="btn-secondary"
            style={{ padding: '4px 12px', fontSize: 12 }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(objective.id)}
            className="btn-danger"
            style={{ padding: '4px 12px', fontSize: 12 }}
          >
            Delete
          </button>
        </div>
      </div>

      {showComments && (
        <div style={{ marginTop: 16, borderTop: '1px solid #F5F0DC', paddingTop: 16 }}>
          <CommentThread
            comments={objective.comments}
            onAddComment={addComment}
            onAddReply={addReply}
            teamMembers={teamMembers}
          />
        </div>
      )}
    </div>
  );
}
