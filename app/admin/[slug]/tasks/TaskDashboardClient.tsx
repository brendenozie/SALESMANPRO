"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ClipboardDocumentCheckIcon, 
  ArrowPathIcon, 
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  PlusIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";

type Task = {
  id: string;
  taskName: string;
  dueDate: string;
  dueTime: string;
  description: string;
  icon: string;
  status: "pending" | "ongoing" | "completed";
};

type Props = {
  tasksData: Task[];
};

export default function TaskDashboard({ tasksData }: Props) {
  const [tasks, setTasks] = useState<Task[]>(tasksData);
  const [draggedOverStatus, setDraggedOverStatus] = useState<string | null>(null);

  const statuses = [
    { id: "pending", label: "Backlog", color: "amber", icon: ClipboardDocumentCheckIcon },
    { id: "ongoing", label: "In Progress", color: "blue", icon: ArrowPathIcon },
    { id: "completed", label: "Finished", color: "emerald", icon: CheckCircleIcon },
  ] as const;

  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const status = task.status || "pending";
      if (!acc[status]) acc[status] = [];
      acc[status].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task["status"]) => {
    e.preventDefault();
    setDraggedOverStatus(null);
    const taskId = e.dataTransfer.getData("taskId");

    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05070a] p-4 lg:p-8 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Workflow <span className="text-indigo-600 dark:text-indigo-500">Orchestrator</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Drag and drop to reorder your sales priority.</p>
          </div>
          <button className="group flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold shadow-sm hover:border-indigo-500 transition-all">
            <PlusIcon className="h-5 w-5 text-indigo-500 group-hover:rotate-90 transition-transform" />
            <span className="text-slate-700 dark:text-slate-200">New Task</span>
          </button>
        </header>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {statuses.map((status) => (
            <div
              key={status.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDraggedOverStatus(status.id);
              }}
              onDragLeave={() => setDraggedOverStatus(null)}
              onDrop={(e) => handleDrop(e, status.id as Task["status"])}
              className={`relative flex flex-col rounded-[2rem] p-5 transition-all duration-300 min-h-[700px] ${
                draggedOverStatus === status.id 
                  ? "bg-indigo-500/5 ring-2 ring-indigo-500/20 ring-dashed" 
                  : "bg-slate-200/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-${status.color}-500/10 text-${status.color}-500`}>
                    <status.icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-black uppercase tracking-widest text-xs text-slate-600 dark:text-slate-400">
                    {status.label}
                  </h2>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-[10px] font-black">
                    {groupedTasks[status.id]?.length || 0}
                  </span>
                </div>
                <button className="text-slate-400 hover:text-white">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Task Cards */}
              <div className="space-y-4">
                {groupedTasks[status.id]?.length > 0 ? (
                  groupedTasks[status.id].map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-500/40 transition-all cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-2xl">{task.icon}</span>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                          <ClockIcon className="h-3 w-3 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                            {task.dueTime}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-500 transition-colors">
                        {task.taskName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-5 font-medium leading-relaxed">
                        {task.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-slate-400">
                          <CalendarIcon className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase">{task.dueDate}</span>
                        </div>
                        <Link href={`/tasks/${task.id}`}>
                          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline cursor-pointer">
                            Manage
                          </span>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 opacity-20">
                    <status.icon className="h-12 w-12 mb-2" />
                    <p className="text-xs font-black uppercase tracking-widest">Empty Space</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}