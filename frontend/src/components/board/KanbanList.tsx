'use client';

import React, { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Trash2, X } from 'lucide-react';
import { List } from '@/types';
import { useBoardStore } from '@/lib/board-store';
import { KanbanCard } from './KanbanCard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface KanbanListProps {
  list: List;
  index: number;
}

export function KanbanList({ list, index }: KanbanListProps) {
  const {
    updateListTitle,
    deleteList,
    addCard,
    searchQuery,
    filterLabels,
    filterPriority,
  } = useBoardStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== list.title) {
      updateListTitle(list.id, title.trim());
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    setIsSubmittingCard(true);
    try {
      await addCard(list.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    } catch (err) {
      console.error('Failed to create card:', err);
    } finally {
      setIsSubmittingCard(false);
    }
  };

  // Filter cards based on active search, labels, priority
  const filteredCards = (list.cards || []).filter((card) => {
    if (
      searchQuery &&
      !card.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !card.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (
      filterLabels.length > 0 &&
      !card.labels?.some((cl) => filterLabels.includes(cl.labelId))
    ) {
      return false;
    }

    if (filterPriority && card.priority !== filterPriority) {
      return false;
    }

    return true;
  });

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "flex max-h-[calc(100vh-8rem)] w-72 shrink-0 flex-col rounded-2xl border border-border/40 bg-board-list/90 p-3 shadow-sm backdrop-blur-md transition-all duration-150",
            snapshot.isDragging && "rotate-2 shadow-2xl ring-2 ring-primary/50"
          )}
        >
          {/* List Header */}
          <div
            {...provided.dragHandleProps}
            className="mb-2 flex items-center justify-between gap-2 px-1 cursor-grab active:cursor-grabbing"
          >
            <div className="flex flex-1 items-center gap-2">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  className="h-7 w-full rounded bg-background px-2 text-xs font-bold text-foreground outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              ) : (
                <h3
                  onClick={() => {
                    setTitle(list.title);
                    setIsEditingTitle(true);
                  }}
                  className="cursor-pointer text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary transition-colors truncate"
                >
                  {list.title}
                </h3>
              )}

              <span className="rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {filteredCards.length}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => setIsAddingCard(true)}
                  className="gap-2 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Add card
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => deleteList(list.id)}
                  className="gap-2 text-xs text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete list
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Cards Droppable Area */}
          <Droppable droppableId={list.id} type="CARD">
            {(dropProvided, dropSnapshot) => (
              <div
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                className={cn(
                  "flex-1 overflow-y-auto px-0.5 kanban-scrollbar min-h-[10px] rounded-lg transition-colors",
                  dropSnapshot.isDraggingOver && "bg-primary/5 ring-1 ring-primary/20"
                )}
              >
                {filteredCards.map((card, cardIndex) => (
                  <KanbanCard key={card.id} card={card} index={cardIndex} />
                ))}
                {dropProvided.placeholder}
              </div>
            )}
          </Droppable>

          {/* List Footer: Inline Add Card Composer */}
          <div className="mt-2 pt-1">
            {isAddingCard ? (
              <form onSubmit={handleCreateCard} className="space-y-2">
                <textarea
                  placeholder="Enter a title for this card..."
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCreateCard(e);
                    }
                  }}
                  className="h-16 w-full resize-none rounded-xl border border-input bg-card p-2 text-xs text-card-foreground shadow-sm outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <div className="flex items-center gap-1.5">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmittingCard || !newCardTitle.trim()}
                    className="h-7 text-xs font-semibold"
                  >
                    Add card
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsAddingCard(false);
                      setNewCardTitle('');
                    }}
                    className="h-7 w-7"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingCard(true)}
                className="flex w-full items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-card hover:text-foreground hover:shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add card</span>
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
