'use client'

import { useState, useEffect, useCallback } from 'react'
import { Comment } from '@/types/blog'

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'mavn812v'
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const SANITY_WRITE_TOKEN = process.env.NEXT_PUBLIC_SANITY_WRITE_TOKEN || ''
const SANITY_API_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01`

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function getInitial(name: string): string {
  return (name || 'A').charAt(0).toUpperCase()
}

function CommentForm({
  postId,
  parentCommentId,
  parentName,
  onSuccess,
  onCancel,
}: {
  postId: string
  parentCommentId?: string
  parentName?: string
  onSuccess: () => void
  onCancel?: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !text.trim()) {
      setError('All fields are required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      const mutations = [{
        create: {
          _type: 'comment',
          name: name.trim(),
          email: email.trim(),
          text: text.trim(),
          post: { _type: 'reference', _ref: postId },
          approved: false,
          createdAt: new Date().toISOString(),
          ...(parentCommentId ? { parentComment: { _type: 'reference', _ref: parentCommentId } } : {}),
        },
      }]

      const res = await fetch(`${SANITY_API_URL}/data/mutate/${SANITY_DATASET}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SANITY_WRITE_TOKEN}`,
        },
        body: JSON.stringify({ mutations }),
      })

      if (!res.ok) throw new Error('Failed to submit comment')

      setSubmitted(true)
      setName('')
      setEmail('')
      setText('')
      onSuccess()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="comment-success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <span>
          {parentCommentId
            ? 'Your reply has been submitted and is awaiting approval.'
            : 'Your comment has been submitted and is awaiting approval.'}
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      {parentName && (
        <div className="comment-replying-to">
          Replying to <strong>{parentName}</strong>
          {onCancel && (
            <button type="button" onClick={onCancel} className="comment-cancel-reply">
              Cancel
            </button>
          )}
        </div>
      )}
      <div className="comment-form-row">
        <div className="comment-form-field">
          <input
            type="text"
            placeholder="Your Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div className="comment-form-field">
          <input
            type="email"
            placeholder="Your Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
        </div>
      </div>
      <div className="comment-form-field">
        <textarea
          placeholder={parentCommentId ? 'Write your reply...' : 'Write your comment...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          disabled={submitting}
        />
      </div>
      {error && <div className="comment-error">{error}</div>}
      <div className="comment-form-actions">
        <button type="submit" disabled={submitting} className="comment-submit-btn">
          {submitting ? 'Submitting...' : parentCommentId ? 'Post Reply' : 'Post Comment'}
        </button>
        <span className="comment-form-note">Your email will not be published. Comments are moderated.</span>
      </div>
    </form>
  )
}

function SingleComment({
  comment,
  postId,
  depth = 0,
  onReplySuccess,
}: {
  comment: Comment
  postId: string
  depth?: number
  onReplySuccess: () => void
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  return (
    <div className={`comment-item ${depth > 0 ? 'comment-reply' : ''}`} style={depth > 0 ? { marginLeft: `${Math.min(depth, 3) * 24}px` } : undefined}>
      <div className="comment-header">
        <div className="comment-avatar">{getInitial(comment.name)}</div>
        <div className="comment-meta">
          <span className="comment-author">{comment.name}</span>
          <span className="comment-time">{timeAgo(comment.createdAt)}</span>
        </div>
      </div>
      <div className="comment-text">{comment.text}</div>
      <div className="comment-actions">
        <button
          type="button"
          className="comment-reply-btn"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 17 4 12 9 7" />
            <path d="M20 18v-2a4 4 0 00-4-4H4" />
          </svg>
          Reply
        </button>
      </div>
      {showReplyForm && (
        <div className="comment-reply-form-wrapper">
          <CommentForm
            postId={postId}
            parentCommentId={comment._id}
            parentName={comment.name}
            onSuccess={() => {
              setShowReplyForm(false)
              onReplySuccess()
            }}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <SingleComment
              key={reply._id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              onReplySuccess={onReplySuccess}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentCount, setCommentCount] = useState(0)

  const fetchComments = useCallback(async () => {
    try {
      const query = encodeURIComponent(
        `*[_type == "comment" && post._ref == "${postId}" && approved == true] | order(createdAt asc) { _id, name, text, createdAt, approved, parentComment }`
      )
      const res = await fetch(`${SANITY_API_URL}/data/query/${SANITY_DATASET}?query=${query}`)
      const data = await res.json()
      const allComments: Comment[] = data.result || []

      const topLevel: Comment[] = []
      const replyMap: Record<string, Comment[]> = {}

      for (const c of allComments) {
        if (c.parentComment && c.parentComment._ref) {
          if (!replyMap[c.parentComment._ref]) {
            replyMap[c.parentComment._ref] = []
          }
          replyMap[c.parentComment._ref].push(c)
        } else {
          topLevel.push(c)
        }
      }

      const attachReplies = (comment: Comment): Comment => ({
        ...comment,
        replies: (replyMap[comment._id] || []).map(attachReplies),
      })

      const threaded = topLevel.map(attachReplies)
      setComments(threaded)
      setCommentCount(allComments.length)
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  return (
    <section className="comment-section">
      <h2 className="comment-section-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        Comments{commentCount > 0 ? ` (${commentCount})` : ''}
      </h2>

      <CommentForm postId={postId} onSuccess={fetchComments} />

      {loading ? (
        <div className="comment-loading">
          <div className="comment-loading-spinner" />
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="comment-empty">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="comment-list">
          {comments.map((comment) => (
            <SingleComment
              key={comment._id}
              comment={comment}
              postId={postId}
              onReplySuccess={fetchComments}
            />
          ))}
        </div>
      )}
    </section>
  )
}
