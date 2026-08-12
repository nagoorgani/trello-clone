'use client';

import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useBoardStore } from '@/lib/board-store';
import { CardPriority } from '@/types';

export function AnalyticsView() {
  const { board } = useBoardStore();

  if (!board || !board.lists) return null;

  const lists = board.lists || [];
  const allCards = lists.flatMap((l) => l.cards || []);
  const totalCards = allCards.length;
  const completedCards = allCards.filter((c) => c.isCompleted).length;
  const completionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  // Priority counts
  const priorities: CardPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
  const priorityCounts = priorities.map((p) => ({
    priority: p,
    count: allCards.filter((c) => c.priority === p).length,
  }));

  // Checklist item counts
  const allChecklistItems = allCards.flatMap((c) =>
    (c.checklists || []).flatMap((cl) => cl.items || [])
  );
  const completedItems = allChecklistItems.filter((i) => i.isCompleted).length;
  const checklistRate =
    allChecklistItems.length > 0
      ? Math.round((completedItems / allChecklistItems.length) * 100)
      : 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Total Cards</span>
            <ListTodo className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-foreground">{totalCards}</div>
          <p className="mt-1 text-[11px] text-muted-foreground">across {lists.length} lists</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Completed Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-foreground">{completionRate}%</div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Subtask Velocity</span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-foreground">
            {completedItems} / {allChecklistItems.length}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">{checklistRate}% subtasks finished</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Urgent & High</span>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-foreground">
            {allCards.filter((c) => c.priority === 'URGENT' || c.priority === 'HIGH').length}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">require high focus</p>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cards per List */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-foreground">Cards per List</h4>
          <div className="space-y-3">
            {lists.map((list) => {
              const cardCount = list.cards?.length || 0;
              const percent = totalCards > 0 ? Math.round((cardCount / totalCards) * 100) : 0;
              return (
                <div key={list.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>{list.title}</span>
                    <span className="text-muted-foreground">
                      {cardCount} cards ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-foreground">Priority Distribution</h4>
          <div className="space-y-3">
            {priorityCounts.map((p) => {
              const percent = totalCards > 0 ? Math.round((p.count / totalCards) * 100) : 0;
              const colorClass =
                p.priority === 'URGENT'
                  ? 'bg-red-500'
                  : p.priority === 'HIGH'
                  ? 'bg-orange-500'
                  : p.priority === 'MEDIUM'
                  ? 'bg-blue-500'
                  : 'bg-zinc-500';

              return (
                <div key={p.priority} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground capitalize">
                    <span>{p.priority.toLowerCase()}</span>
                    <span className="text-muted-foreground">
                      {p.count} cards ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
