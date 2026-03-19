'use client';

import { useState } from 'react';
import { Comment } from '../lib/types';

interface CommentThreadProps {
  comments: Comment[];
  onAddComment: (text: string, author: string) => void;
  onAddReply: (commentId: string, text: string, author: string) => void;
  teamMembers: string[];
}

function timeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = ['#2D5A3D', '#6B4E8B', '#D4883A', '#3A7CA5', '#C62828'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function SingleComment({
  comment,
  onReply,
  teamMembers,
  isReply = false,
}: {
  comment: Comment;
  onReply: (commentId: string, text: string, author: string) => void;
  teamMembers: string[];
  isReply?: boolean;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyAuthor, setReplyAuthor] = useState(teamMembers[0] || '');

  function handleSubmitReply() {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText, replyAuthor);
    setReplyText('');
    setShowReplyForm(false);
  }

  return (
    <div style={{ marginBottom: isReply ? 8 : 12 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: getAvatarColor(comment.author),
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {getInitials(comment.author)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{comment.author}</span>
            <span style={{ fontSize: 11, color: '#B8B8A8' }}>{timeAgo(comment.timestamp)}</span>
          </div>
          <p style={{ fontSize: 13, margin: '0 0 4px 0', lineHeight: 1.5, color: '#1A1A1A' }}>
            {comment.text}
          </p>
          {!isReply && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 12,
                color: '#3A7CA5',
                cursor: 'pointer',
                padding: 0,
                fontWeight: 500,
              }}
            >
              Reply
            </button>
          )}

          {showReplyForm && (
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <select
                value={replyAuthor}
                onChange={e => setReplyAuthor(e.target.value)}
                style={{ width: 120, fontSize: 12, padding: '4px 8px' }}
              >
                {teamMembers.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                style={{ flex: 1, fontSize: 12, padding: '4px 8px' }}
                onKeyDown={e => e.key === 'Enter' && handleSubmitReply()}
              />
              <button onClick={handleSubmitReply} className="btn-primary" style={{ padding: '4px 12px', fontSize: 12 }}>
                Reply
              </button>
            </div>
          )}

          {comment.replies.length > 0 && (
            <div className="comment-thread" style={{ marginTop: 8 }}>
              {comment.replies.map(reply => (
                <SingleComment
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  teamMembers={teamMembers}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentThread({ comments, onAddComment, onAddReply, teamMembers }: CommentThreadProps) {
  const [newText, setNewText] = useState('');
  const [author, setAuthor] = useState(teamMembers[0] || '');

  function handleSubmit() {
    if (!newText.trim()) return;
    onAddComment(newText, author);
    setNewText('');
  }

  return (
    <div>
      {comments.length === 0 && (
        <p style={{ fontSize: 13, color: '#B8B8A8', textAlign: 'center', margin: '8px 0' }}>
          No comments yet. Start the conversation.
        </p>
      )}

      {comments.map(comment => (
        <SingleComment
          key={comment.id}
          comment={comment}
          onReply={onAddReply}
          teamMembers={teamMembers}
        />
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <select
          value={author}
          onChange={e => setAuthor(e.target.value)}
          style={{ width: 130, fontSize: 12, padding: '6px 8px' }}
        >
          {teamMembers.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          value={newText}
          onChange={e => setNewText(e.target.value)}
          placeholder="Add a comment..."
          style={{ flex: 1, fontSize: 13, padding: '6px 10px' }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        <button onClick={handleSubmit} className="btn-primary" style={{ padding: '6px 16px', fontSize: 13 }}>
          Post
        </button>
      </div>
    </div>
  );
}
