'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  EyeIcon,
  StopIcon,
  SparklesIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { MascotTaskRecord, MascotTaskState } from '@/lib/ai/mascot/taskTypes';

interface MascotTaskCenterProps {
  companyId: string;
  storeSlug?: string;
  userRole?: string;
  compact?: boolean; // True when rendered inside the floating mascot panel
  onSelectTask?: (task: MascotTaskRecord) => void;
}

export const MascotTaskCenter: React.FC<MascotTaskCenterProps> = ({
  companyId,
  storeSlug,
  userRole = 'ADMIN',
  compact = false,
  onSelectTask,
}) => {
  const [tasks, setTasks] = useState<MascotTaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'APPROVALS' | 'HISTORY' | 'ALL'>('ACTIVE');
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<MascotTaskRecord | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (companyId) params.append('companyId', companyId);
      if (search) params.append('search', search);

      const res = await fetch(`/api/ai/mascot/tasks?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('[MascotTaskCenter] Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [companyId, search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Real-time polling when there are active/running tasks
  useEffect(() => {
    const hasActive = tasks.some(
      (t) => t.status === 'RUNNING' || t.status === 'QUEUED' || t.status === 'RETRYING'
    );
    if (!hasActive) return;

    const interval = setInterval(() => {
      fetchTasks();
    }, 3000);

    return () => clearInterval(interval);
  }, [tasks, fetchTasks]);

  // Task Actions
  const handleApprove = async (taskId: string) => {
    setActionLoadingId(taskId);
    try {
      const res = await fetch(`/api/ai/mascot/tasks/${taskId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTasks();
      } else {
        alert(data.error || 'Approval failed');
      }
    } catch (err: any) {
      alert(err?.message || 'Approval failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (taskId: string) => {
    const reason = prompt('Please enter rejection reason:', 'Declined by reviewer');
    if (!reason) return;

    setActionLoadingId(taskId);
    try {
      const res = await fetch(`/api/ai/mascot/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, reason }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTasks();
      } else {
        alert(data.error || 'Rejection failed');
      }
    } catch (err: any) {
      alert(err?.message || 'Rejection failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (taskId: string) => {
    if (!confirm('Are you sure you want to abort this background task? Reserved credits will be refunded.')) {
      return;
    }

    setActionLoadingId(taskId);
    try {
      const res = await fetch(`/api/ai/mascot/tasks/${taskId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, reason: 'Cancelled by user' }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTasks();
      } else {
        alert(data.error || 'Cancellation failed');
      }
    } catch (err: any) {
      alert(err?.message || 'Cancellation failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRetry = async (taskId: string) => {
    setActionLoadingId(taskId);
    try {
      const res = await fetch(`/api/ai/mascot/tasks/${taskId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTasks();
      } else {
        alert(data.error || 'Retry failed');
      }
    } catch (err: any) {
      alert(err?.message || 'Retry failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePause = async (taskId: string) => {
    setActionLoadingId(taskId);
    try {
      const res = await fetch(`/api/ai/mascot/tasks/${taskId}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTasks();
      } else {
        alert(data.error || 'Pause failed');
      }
    } catch (err: any) {
      alert(err?.message || 'Pause failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResume = async (taskId: string) => {
    setActionLoadingId(taskId);
    try {
      const res = await fetch(`/api/ai/mascot/tasks/${taskId}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTasks();
      } else {
        alert(data.error || 'Resume failed');
      }
    } catch (err: any) {
      alert(err?.message || 'Resume failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter tasks based on activeTab
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'ACTIVE') {
      return ['RUNNING', 'QUEUED', 'PENDING', 'VALIDATING', 'RETRYING', 'PAUSED'].includes(t.status);
    }
    if (activeTab === 'APPROVALS') {
      return t.status === 'AWAITING_APPROVAL';
    }
    if (activeTab === 'HISTORY') {
      return ['COMPLETED', 'PARTIALLY_COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(t.status);
    }
    return true;
  });

  const activeCount = tasks.filter((t) =>
    ['RUNNING', 'QUEUED', 'RETRYING', 'PAUSED'].includes(t.status)
  ).length;

  const approvalCount = tasks.filter((t) => t.status === 'AWAITING_APPROVAL').length;

  const getStatusBadge = (status: MascotTaskState) => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Running
          </span>
        );
      case 'QUEUED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            <ClockIcon className="w-3 h-3" /> Queued
          </span>
        );
      case 'AWAITING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-300 dark:border-purple-700 animate-pulse">
            <ShieldCheckIcon className="w-3.5 h-3.5" /> Needs Approval
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
            <PauseIcon className="w-3 h-3" /> Paused
          </span>
        );
      case 'RETRYING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">
            <ArrowPathIcon className="w-3 h-3 animate-spin" /> Retrying
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircleIcon className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'PARTIALLY_COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
            <ExclamationTriangleIcon className="w-3.5 h-3.5" /> Partial
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
            <XCircleIcon className="w-3.5 h-3.5" /> Failed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <StopIcon className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-900 ${compact ? 'text-sm' : 'p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800'}`}>
      {/* Header & Tabs */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                AI Background Task Center
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Persistent, asynchronous operations executing independently across your store
              </p>
            </div>
          </div>
          <button
            onClick={fetchTasks}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 transition"
            title="Refresh tasks"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'ACTIVE'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Active</span>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold">
                {activeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('APPROVALS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'APPROVALS'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Needs Approval</span>
            {approvalCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold animate-pulse">
                {approvalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'HISTORY'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            History
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3">
        {loading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <ArrowPathIcon className="w-6 h-6 animate-spin mb-2 text-indigo-500" />
            <p className="text-xs">Synchronizing task state...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
            <DocumentTextIcon className="w-10 h-10 stroke-1 mb-2 text-slate-300 dark:text-slate-700" />
            <p className="font-medium text-slate-600 dark:text-slate-300 text-sm">No tasks in this category</p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Ask the Mascot to run bulk price adjustments, audit dead stock, or generate reports in the background.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isExpanded = expandedTaskId === task.id;
            const isActionLoading = actionLoadingId === task.id;

            return (
              <div
                key={task.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                {/* Top Row: Title, Type, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {task.title}
                      </span>
                      {getStatusBadge(task.status)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span>#{task.id.slice(-6)}</span>
                      <span>•</span>
                      <span>{task.taskType.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>{new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {task.credits?.reserved > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                            {task.credits.consumed || task.credits.reserved} credits
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={isExpanded ? 'Collapse' : 'Expand details'}
                  >
                    {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                  </button>
                </div>

                {/* Progress Bar (if Running or Queued) */}
                {(task.status === 'RUNNING' || task.status === 'QUEUED' || task.status === 'RETRYING') && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span className="truncate max-w-[200px]">{task.progress.currentStep}</span>
                      <span className="font-semibold">{task.progress.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${task.progress.percent}%` }}
                      />
                    </div>
                    {task.progress.totalCount > 0 && (
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>
                          {task.progress.processedCount} of {task.progress.totalCount} items verified
                        </span>
                        {task.progress.estimatedRemainingSeconds !== null &&
                          task.progress.estimatedRemainingSeconds !== undefined &&
                          task.progress.estimatedRemainingSeconds > 0 && (
                            <span>~{task.progress.estimatedRemainingSeconds}s remaining</span>
                          )}
                      </div>
                    )}
                  </div>
                )}

                {/* Approval Prompt Box (if Awaiting Approval) */}
                {task.status === 'AWAITING_APPROVAL' && task.approval && (
                  <div className="mt-3 p-3 rounded-lg bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80">
                    <div className="flex items-start gap-2">
                      <ShieldCheckIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-purple-900 dark:text-purple-200">
                          {task.approval.title}
                        </p>
                        <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                          {task.approval.description}
                        </p>
                        {task.approval.risks && task.approval.risks.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {task.approval.risks.map((risk, i) => (
                              <div key={i} className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                <span>⚠️</span>
                                <span>{risk}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleApprove(task.id)}
                            disabled={isActionLoading}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition shadow-sm"
                          >
                            Approve & Execute
                          </button>
                          <button
                            onClick={() => handleReject(task.id)}
                            disabled={isActionLoading}
                            className="px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-300 text-xs transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Output Summary preview (if Completed) */}
                {task.status === 'COMPLETED' && task.output?.summary && !isExpanded && (
                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 bg-emerald-50/40 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                    {task.output.summary.replace(/[#*`]/g, '')}
                  </div>
                )}

                {/* Error Box (if Failed) */}
                {task.status === 'FAILED' && task.error && (
                  <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-start gap-1.5">
                    <XCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">{task.error.code}: {task.error.message}</p>
                      <p className="text-[10px] text-red-500 mt-0.5">Category: {task.error.category}</p>
                    </div>
                  </div>
                )}

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-3">
                    {/* Subtasks breakdown */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Subtask Execution Graph
                        </h4>
                        <div className="space-y-1">
                          {task.subtasks.map((st) => (
                            <div
                              key={st.id}
                              className="flex items-center justify-between text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800"
                            >
                              <div className="flex items-center gap-1.5">
                                {st.status === 'COMPLETED' && <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />}
                                {st.status === 'RUNNING' && <ArrowPathIcon className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
                                {st.status === 'FAILED' && <XCircleIcon className="w-3.5 h-3.5 text-red-500" />}
                                {st.status === 'PENDING' && <ClockIcon className="w-3.5 h-3.5 text-slate-400" />}
                                <span>{st.title}</span>
                              </div>
                              <span className="text-[10px] font-medium text-slate-400 capitalize">{st.status.toLowerCase()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Output and Deep Links */}
                    {task.output?.summary && (
                      <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                        <div className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
                          Result Summary:
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
                          {task.output.summary}
                        </div>
                      </div>
                    )}

                    {task.deepLinks && task.deepLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {task.deepLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.href}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-100 transition"
                          >
                            <span>{link.label}</span>
                            <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Checkpoint Timeline */}
                    {task.progress.checkpoints && task.progress.checkpoints.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          Checkpoint Log
                        </h4>
                        <div className="space-y-1 max-h-36 overflow-y-auto font-mono text-[11px] bg-slate-900 text-slate-300 p-2 rounded-lg">
                          {task.progress.checkpoints.map((cp, idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="text-slate-500">[{new Date(cp.timestamp).toLocaleTimeString()}]</span>
                              <span className="text-indigo-400">[{cp.step}]</span>
                              <span className="flex-1">{cp.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Controls */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      {task.status === 'RUNNING' && (
                        <>
                          <button
                            onClick={() => handlePause(task.id)}
                            disabled={isActionLoading}
                            className="px-2.5 py-1 rounded text-xs border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            Pause
                          </button>
                          <button
                            onClick={() => handleCancel(task.id)}
                            disabled={isActionLoading}
                            className="px-2.5 py-1 rounded text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
                          >
                            Abort
                          </button>
                        </>
                      )}

                      {task.status === 'PAUSED' && (
                        <button
                          onClick={() => handleResume(task.id)}
                          disabled={isActionLoading}
                          className="px-2.5 py-1 rounded text-xs bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                        >
                          Resume
                        </button>
                      )}

                      {['FAILED', 'EXPIRED', 'PARTIALLY_COMPLETED'].includes(task.status) && (
                        <button
                          onClick={() => handleRetry(task.id)}
                          disabled={isActionLoading}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                        >
                          <ArrowPathIcon className="w-3 h-3" /> Retry
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
