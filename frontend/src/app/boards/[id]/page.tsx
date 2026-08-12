'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useBoardStore } from '@/lib/board-store';
import { useUIStore } from '@/lib/ui-store';
import { useBoardSocket } from '@/lib/socket';
import { BoardHeader } from '@/components/board/BoardHeader';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { CalendarView } from '@/components/views/CalendarView';
import { TableView } from '@/components/views/TableView';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { Skeleton } from '@/components/ui/skeleton';

export default function BoardPage() {
  const params = useParams();
  const boardId = params?.id as string;

  const { board, isLoading, fetchBoard } = useBoardStore();
  const { activeView } = useUIStore();

  // Connect socket for real-time collaboration & presence
  useBoardSocket(boardId);

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId).catch((err) => console.error(err));
    }
  }, [boardId, fetchBoard]);

  if (isLoading || !board) {
    return (
      <div className="flex-1 flex flex-col p-6 space-y-6">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <div className="flex gap-4">
          <Skeleton className="h-96 w-72 rounded-2xl" />
          <Skeleton className="h-96 w-72 rounded-2xl" />
          <Skeleton className="h-96 w-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden transition-all duration-500"
      style={{
        background: board.backgroundValue.includes('linear-gradient')
          ? board.backgroundValue
          : board.backgroundValue || 'var(--background)',
      }}
    >
      {/* Top Board Toolbar */}
      <BoardHeader />

      {/* Dynamic View Renderer */}
      {activeView === 'kanban' && <KanbanBoard />}
      {activeView === 'calendar' && <CalendarView />}
      {activeView === 'table' && <TableView />}
      {activeView === 'analytics' && <AnalyticsView />}
    </div>
  );
}
