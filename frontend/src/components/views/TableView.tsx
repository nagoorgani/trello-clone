'use client';

import React from 'react';
import { Table as TableIcon, CheckCircle2, Clock } from 'lucide-react';
import { useBoardStore } from '@/lib/board-store';
import { useUIStore } from '@/lib/ui-store';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';

export function TableView() {
  const { board } = useBoardStore();
  const { setActiveCardId } = useUIStore();

  if (!board || !board.lists) return null;

  // Flatten all cards with parent list name
  const cards = board.lists.flatMap((list) =>
    (list.cards || []).map((c) => ({ ...c, listTitle: list.title }))
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="py-3 px-4">Task Title</th>
              <th className="py-3 px-4">Status / List</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Labels</th>
              <th className="py-3 px-4">Checklist</th>
              <th className="py-3 px-4">Assignees</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {cards.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                  No cards found in this board.
                </td>
              </tr>
            ) : (
              cards.map((card) => {
                const totalItems = (card.checklists || []).reduce(
                  (acc, cl) => acc + (cl.items?.length || 0),
                  0
                );
                const completedItems = (card.checklists || []).reduce(
                  (acc, cl) =>
                    acc + (cl.items?.filter((i) => i.isCompleted).length || 0),
                  0
                );

                return (
                  <tr
                    key={card.id}
                    onClick={() => setActiveCardId(card.id)}
                    className="cursor-pointer hover:bg-accent/40 transition-colors"
                  >
                    {/* Title */}
                    <td className="py-3 px-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        {card.isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <div
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: card.coverColor || '#94a3b8',
                            }}
                          />
                        )}
                        <span
                          className={card.isCompleted ? 'line-through text-muted-foreground' : ''}
                        >
                          {card.title}
                        </span>
                      </div>
                    </td>

                    {/* Status / List */}
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-foreground">
                        {card.listTitle}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      <Badge variant={card.priority.toLowerCase() as any} className="capitalize text-[10px]">
                        {card.priority}
                      </Badge>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4 text-muted-foreground">
                      {card.dueDate ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(card.dueDate)}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Labels */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {card.labels?.map((cl) => (
                          <span
                            key={cl.id}
                            className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{
                              backgroundColor: `${cl.label.color}25`,
                              color: cl.label.color,
                            }}
                          >
                            {cl.label.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Checklist */}
                    <td className="py-3 px-4 text-muted-foreground">
                      {totalItems > 0 ? `${completedItems}/${totalItems}` : '-'}
                    </td>

                    {/* Assignees */}
                    <td className="py-3 px-4">
                      {card.members && card.members.length > 0 ? (
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {card.members.map((m) => (
                            <Avatar key={m.userId} className="h-5 w-5 ring-1 ring-background">
                              <AvatarImage src={m.user.avatarUrl || ''} />
                              <AvatarFallback className="text-[8px] bg-primary text-white">
                                {m.user.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
