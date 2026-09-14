"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { HiXMark, HiPaperAirplane, HiTrash } from "react-icons/hi2";
import { GhubaFeedItem } from "@/lib/ghuba-feed-service";

interface CommentItem {
  id: string;
  listingId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
  };
}

interface GhubaCommentDrawerProps {
  isOpen: boolean;
  item: GhubaFeedItem | null;
  onClose: () => void;
  onCommentCountChange?: (listingId: string, count: number) => void;
}

export const GhubaCommentDrawer: React.FC<GhubaCommentDrawerProps> = ({
  isOpen,
  item,
  onClose,
  onCommentCountChange,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !item) {
      setComments([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/ghuba/listings/${item.listingId}/comments?limit=25`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.comments) {
          setComments(data.comments);
          setTotalCount(data.totalCount || data.comments.length);
        }
      })
      .catch((err) => {
        console.error("Failed to load comments", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !newComment.trim() || isSubmitting) return;

    const content = newComment.trim();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/ghuba/listings/${item.listingId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Please sign in to comment");
        } else {
          const err = await res.json();
          toast.error(err.error || "Failed to post comment");
        }
        return;
      }

      const data = await res.json();
      if (data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        const updatedCount = (totalCount || 0) + 1;
        setTotalCount(updatedCount);
        onCommentCountChange?.(item.listingId, updatedCount);
        setNewComment("");
      }
    } catch {
      toast.error("Network error posting comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/ghuba/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to delete comment");
        return;
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      const updatedCount = Math.max(0, totalCount - 1);
      setTotalCount(updatedCount);
      if (item) {
        onCommentCountChange?.(item.listingId, updatedCount);
      }
      toast.success("Comment deleted");
    } catch {
      toast.error("Network error deleting comment");
    }
  };

  const formatDate = (iso: string) => {
    try {
      const date = new Date(iso);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 60) return "just now";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return "";
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-[420px] max-h-[75vh] sm:h-[100dvh] flex flex-col rounded-t-3xl sm:rounded-none sm:rounded-l-2xl border-t sm:border-t-0 sm:border-l border-white/10 bg-[#121212] text-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base">Comments</h3>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
              {totalCount}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close comments"
          >
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        {/* Comment Thread List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/50 text-sm">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent mb-2" />
              <span>Loading comments...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-white/50">
              <p className="text-sm font-medium">No comments yet.</p>
              <p className="text-xs text-white/40 mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex items-start gap-3 text-xs">
                <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-neutral-800">
                  {c.user.avatar ? (
                    <img
                      src={c.user.avatar}
                      alt={c.user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-amber-600 to-rose-600 font-bold text-white text-[10px]">
                      {c.user.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-white/90">{c.user.name}</span>
                    <span className="text-[10px] text-white/40">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-white/80 mt-1 leading-relaxed break-words">{c.content}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="text-white/30 hover:text-rose-400 p-1 transition-colors"
                  title="Delete comment"
                >
                  <HiTrash className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="border-t border-white/10 p-3 bg-neutral-900/90">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-neutral-800/80 px-3 py-1.5 focus-within:border-amber-400/80 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-xs text-white placeholder-white/40 outline-none"
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-400 transition-colors"
              aria-label="Send comment"
            >
              <HiPaperAirplane className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
