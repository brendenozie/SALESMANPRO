/**
 * components/ghuba/comments/ProductCommentsSection.tsx
 *
 * Modern, interactive comments and discussion section for product detail pages.
 * Supports:
 * - Paginated comment loading
 * - Inline threaded replies
 * - Spam / abuse reporting
 * - Optimistic submission feedback
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  FlagIcon,
  ArrowUturnLeftIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface CommentUser {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

interface CommentItem {
  id: string;
  listingId: string;
  parentId?: string | null;
  content: string;
  createdAt: string;
  user: CommentUser;
  replies?: CommentItem[];
}

interface ProductCommentsSectionProps {
  listingId: string;
}

export default function ProductCommentsSection({ listingId }: ProductCommentsSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  const fetchComments = useCallback(async (cursor?: string) => {
    try {
      const url = cursor
        ? `/api/ghuba/listings/${listingId}/comments?cursor=${cursor}`
        : `/api/ghuba/listings/${listingId}/comments`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => (cursor ? [...prev, ...data.comments] : data.comments));
        setHasMore(data.hasMore);
        setNextCursor(data.nextCursor);
        setTotalCount(data.totalCount);
      }
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    if (!session?.user) {
      alert("Please sign in to post a question or comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/ghuba/listings/${listingId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setComments((prev) => [data.comment, ...prev]);
          setTotalCount((prev) => prev + 1);
          setNewComment('');
        }
      }
    } catch (err: any) {
      console.error("Failed to post comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyContent.trim() || isSubmitting) return;

    if (!session?.user) {
      alert("Please sign in to post a reply.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/ghuba/listings/${listingId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent.trim(), parentId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === parentId
                ? { ...c, replies: [...(c.replies || []), data.comment] }
                : c
            )
          );
          setReplyContent('');
          setReplyingToId(null);
        }
      }
    } catch (err: any) {
      console.error("Failed to post reply:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async (commentId: string) => {
    if (reportedIds.has(commentId)) return;
    try {
      await fetch(`/api/ghuba/comments/${commentId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Reported by user' }),
      });
      setReportedIds((prev) => new Set([...prev, commentId]));
    } catch {
      // Ignore
    }
  };

  return (
    <section className="mt-16 pt-10 border-t border-slate-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Customer Questions & Discussions
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Ask about product details, sizing, delivery, or custom requests ({totalCount})
            </p>
          </div>
        </div>
      </div>

      {/* New Comment Input */}
      <form onSubmit={handlePostComment} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={session?.user ? "Ask a question or leave feedback..." : "Sign in to join the discussion..."}
            maxLength={500}
            className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl px-5 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            <span>Post</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-slate-100 dark:bg-zinc-900 rounded-2xl p-5 h-24" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 dark:bg-zinc-950 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800">
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
            No questions or comments yet. Be the first to start the conversation!
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-black text-slate-700 dark:text-zinc-300 text-xs overflow-hidden">
                    {comment.user.avatar ? (
                      <Image src={comment.user.avatar} alt={comment.user.name} width={36} height={36} className="object-cover" />
                    ) : (
                      comment.user.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white mr-2">
                      {comment.user.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                    className="p-1 text-slate-400 hover:text-emerald-600 transition-colors text-xs flex items-center gap-1"
                    title="Reply"
                  >
                    <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px] font-semibold">Reply</span>
                  </button>

                  <button
                    onClick={() => handleReport(comment.id)}
                    disabled={reportedIds.has(comment.id)}
                    className={`p-1 transition-colors text-xs flex items-center gap-1 ${
                      reportedIds.has(comment.id) ? "text-amber-500" : "text-slate-400 hover:text-rose-500"
                    }`}
                    title="Report"
                  >
                    <FlagIcon className="w-3.5 h-3.5" />
                    {reportedIds.has(comment.id) && <span className="text-[10px]">Reported</span>}
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-700 dark:text-zinc-300 pl-12 leading-relaxed">
                {comment.content}
              </p>

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pl-12 space-y-3 pt-2 border-l-2 border-slate-100 dark:border-zinc-800 ml-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-slate-50 dark:bg-zinc-950/50 rounded-xl p-3.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {reply.user.name}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-300">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Reply Input */}
              {replyingToId === comment.id && (
                <div className="pl-12 pt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${comment.user.name}...`}
                    className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => handlePostReply(comment.id)}
                    disabled={isSubmitting || !replyContent.trim()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          ))}

          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => nextCursor && fetchComments(nextCursor)}
                className="px-6 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all"
              >
                Load More Comments
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
