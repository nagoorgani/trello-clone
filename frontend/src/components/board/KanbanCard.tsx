'use client';

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/types';
import { useUIStore } from '@/lib/ui-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDate, isOverdue, isDueSoon, cn } from '@/lib/utils';

interface KanbanCardProps {
  card: Card;
  index: number;
}

export function KanbanCard({ card, index }: KanbanCardProps) {
  const { setActiveCardId } = useUIStore();

  // Checklist counts
  const totalItems = (card.checklists || []).reduce(
    (acc, cl) => acc + (cl.items?.length || 0),
    0
  );
  const completedItems = (card.checklists || []).reduce(
    (acc, cl) => acc + (cl.items?.filter((i) => i.isCompleted).length || 0),
    0
  );

  const overdue = isOverdue(card.dueDate) && !card.isCompleted;
  const dueSoon = isDueSoon(card.dueDate) && !card.isCompleted;

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => setActiveCardId(card.id)}
          className={cn(
            "group relative mb-2 flex cursor-pointer flex-col rounded-xl border border-border/60 bg-card p-3 shadow-sm transition-all duration-150 hover:border-primary/50 hover:shadow-md",
            snapshot.isDragging &&
              "rotate-1 scale-105 border-primary shadow-2xl ring-2 ring-primary/40 z-50",
            card.isCompleted && "opacity-75"
          )}
        >
          {/* Cover Color Strip */}
          {card.coverColor && (
            <div
              className="-mx-3 -mt-3 mb-2.5 h-2.5 rounded-t-xl"
              style={{ backgroundColor: card.coverColor }}
            />
          )}

          {/* Labels Row */}
          {card.labels && card.labels.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {card.labels.map((cl) => (
                <span
                  key={cl.id}
                  className="rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide"
                  style={{
                    backgroundColor: `${cl.label.color}25`,
                    color: cl.label.color,
                  }}
                >
                  {cl.label.name}
                </span>
              ))}
            </div>
          )}

          {/* Card Title */}
          <h4
            className={cn(
              "text-xs font-semibold leading-snug text-card-foreground",
              card.isCompleted && "line-through text-muted-foreground"
            )}
          >
            {card.title}
          </h4>

          {/* Card Indicators (Due date, Checklists, Comments, Assignees) */}
          <div className="mt-3 flex items-center justify-between text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {/* Due Date Indicator */}
              {card.dueDate && (
                <div
                  className={cn(
                    "flex items-center gap-1 rounded px-1.5 py-0.5 font-medium",
                    card.isCompleted
                      ? "bg-emerald-500/10 text-emerald-500"
                      : overdue
                      ? "bg-red-500/10 text-red-500 font-bold"
                      : dueSoon
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-muted/80 text-muted-foreground"
                  )}
                >
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(card.dueDate)}</span>
                </div>
              )}

              {/* Checklist Progress */}
              {totalItems > 0 && (
                <div
                  className={cn(
                    "flex items-center gap-1 rounded px-1.5 py-0.5",
                    completedItems === totalItems
                      ? "bg-emerald-500/10 text-emerald-500 font-semibold"
                      : "bg-muted/60 text-muted-foreground"
                  )}
                >
                  <CheckSquare className="h-3 w-3" />
                  <span>
                    {completedItems}/{totalItems}
                  </span>
                </div>
              )}

              {/* Comments Count */}
              {(card.comments?.length || card._count?.comments || 0) > 0 && (
                <div className="flex items-center gap-0.5">
                  <MessageSquare className="h-3 w-3" />
                  <span>{card.comments?.length || card._count?.comments}</span>
                </div>
              )}

              {/* Attachments Count */}
              {(card.attachments?.length || card._count?.attachments || 0) > 0 && (
                <div className="flex items-center gap-0.5">
                  <Paperclip className="h-3 w-3" />
                  <span>{card.attachments?.length || card._count?.attachments}</span>
                </div>
              )}
            </div>

            {/* Assignee Avatars */}
            {card.members && card.members.length > 0 && (
              <div className="flex -space-x-1.5 overflow-hidden">
                {card.members.slice(0, 3).map((m) => (
                  <Avatar key={m.userId} className="h-5 w-5 ring-1 ring-card">
                    <AvatarImage src={m.user.avatarUrl || ''} />
                    <AvatarFallback className="text-[8px] bg-primary text-white">
                      {m.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
