'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Plus, X } from 'lucide-react';
import { useBoardStore } from '@/lib/board-store';
import { useBoardSocket } from '@/lib/socket';
import { KanbanList } from './KanbanList';
import { CardDetailsModal } from './CardDetailsModal';
import { Button } from '@/components/ui/button';

export function KanbanBoard() {
  const {
    board,
    optimisticMoveCard,
    optimisticReorderList,
    addList,
  } = useBoardStore();

  const { emitMutation } = useBoardSocket(board?.id);

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [isSubmittingList, setIsSubmittingList] = useState(false);

  if (!board || !board.lists) return null;

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination || !board?.lists) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // 1. List Reordering
    if (type === 'LIST') {
      const lists = [...board.lists];
      let newPosition = 1000;

      if (destination.index === 0) {
        newPosition = (lists[0]?.position || 2000) / 2;
      } else if (destination.index === lists.length - 1) {
        newPosition = (lists[lists.length - 1]?.position || 1000) + 1000;
      } else {
        const prev = lists[destination.index - (destination.index > source.index ? 0 : 1)]?.position || 1000;
        const next = lists[destination.index + (destination.index < source.index ? 0 : 1)]?.position || 3000;
        newPosition = (prev + next) / 2;
      }

      optimisticReorderList(source.index, destination.index, newPosition);
      emitMutation('list:reorder', {
        listId: draggableId,
        sourceIndex: source.index,
        targetIndex: destination.index,
        newPosition,
      });
      return;
    }

    // 2. Card Movement
    const sourceList = board.lists.find((l) => l.id === source.droppableId);
    const targetList = board.lists.find((l) => l.id === destination.droppableId);

    if (!sourceList || !targetList) return;

    const targetCards = [...targetList.cards];
    let newPosition = 1000;

    if (targetCards.length === 0) {
      newPosition = 1000;
    } else if (destination.index === 0) {
      newPosition = (targetCards[0]?.position || 2000) / 2;
    } else if (destination.index >= targetCards.length) {
      newPosition = (targetCards[targetCards.length - 1]?.position || 1000) + 1000;
    } else {
      const prevPos = targetCards[destination.index - (destination.droppableId === source.droppableId && destination.index > source.index ? 0 : 1)]?.position || 1000;
      const nextPos = targetCards[destination.index + (destination.droppableId === source.droppableId && destination.index < source.index ? 0 : 1)]?.position || 3000;
      newPosition = (prevPos + nextPos) / 2;
    }

    optimisticMoveCard(
      draggableId,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index,
      newPosition
    );

    emitMutation('card:move', {
      cardId: draggableId,
      sourceListId: source.droppableId,
      targetListId: destination.droppableId,
      position: newPosition,
    });
  };

  const handleAddListSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    setIsSubmittingList(true);
    try {
      await addList(newListTitle.trim());
      setNewListTitle('');
      setIsAddingList(false);
      emitMutation('list:add', { title: newListTitle.trim() });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingList(false);
    }
  };

  return (
    <div className="relative flex flex-1 overflow-x-auto p-3 sm:p-4 kanban-scrollbar touch-pan-x select-none">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-lists" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex items-start gap-3 sm:gap-4"
            >
              {board.lists?.map((list, index) => (
                <KanbanList key={list.id} list={list} index={index} />
              ))}
              {provided.placeholder}

              {/* Add Another List Button / Form */}
              <div className="w-[82vw] sm:w-72 shrink-0">
                {isAddingList ? (
                  <form
                    onSubmit={handleAddListSubmit}
                    className="rounded-2xl border border-border/50 bg-board-list p-3 shadow-md"
                  >
                    <input
                      type="text"
                      placeholder="Enter list title..."
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      className="mb-2 h-9 w-full rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isSubmittingList || !newListTitle.trim()}
                        className="h-8 text-xs font-semibold"
                      >
                        Add list
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsAddingList(false);
                          setNewListTitle('');
                        }}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingList(true)}
                    className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/10 p-3 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/40"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add another list</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Card Details Modal Overlay */}
      <CardDetailsModal />
    </div>
  );
}
