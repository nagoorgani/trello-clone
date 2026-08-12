'use client';

import React, { useState } from 'react';
import {
  Star,
  Columns,
  Calendar,
  Table,
  BarChart3,
  Filter,
  UserPlus,
  Download,
  Share2,
  Lock,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useBoardStore } from '@/lib/board-store';
import { useUIStore, BoardViewType } from '@/lib/ui-store';
import { useBoardSocket } from '@/lib/socket';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FilterPopover } from './FilterPopover';
import { ExportModal } from './ExportModal';
import { cn } from '@/lib/utils';

export function BoardHeader() {
  const { board, setBoard, filterLabels, filterMembers, filterPriority } = useBoardStore();
  const { activeView, setActiveView, setAiModalOpen } = useUIStore();
  const { presenceUsers } = useBoardSocket(board?.id);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(board?.title || '');
  const [isStarred, setIsStarred] = useState(board?.isStarred || false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  if (!board) return null;

  const handleTitleSubmit = async () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== board.title) {
      setBoard({ ...board, title: title.trim() });
      await api.patch(`/boards/${board.id}`, { title: title.trim() });
    }
  };

  const handleToggleStar = async () => {
    setIsStarred(!isStarred);
    try {
      const res: any = await api.post(`/boards/${board.id}/star`);
      setIsStarred(res.isStarred);
    } catch {
      setIsStarred(isStarred);
    }
  };

  const activeFiltersCount =
    filterLabels.length + filterMembers.length + (filterPriority ? 1 : 0);

  const views: { id: BoardViewType; label: string; icon: any }[] = [
    { id: 'kanban', label: 'Kanban', icon: Columns },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'table', label: 'Table', icon: Table },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/30 px-4 py-2.5 backdrop-blur-md text-white">
      {/* Left: Board Title, Star, Privacy */}
      <div className="flex items-center gap-2">
        {isEditingTitle ? (
          <input
            type="text"
            className="h-8 rounded-lg bg-white/20 px-2.5 text-base font-bold text-white outline-none focus:ring-2 focus:ring-primary"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setTitle(board.title);
              setIsEditingTitle(true);
            }}
            className="rounded-lg px-2 py-1 text-base font-bold text-white transition-colors hover:bg-white/10"
          >
            {board.title}
          </button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/80 hover:bg-white/10 hover:text-white"
          onClick={handleToggleStar}
        >
          <Star
            className={cn(
              "h-4 w-4",
              isStarred ? "fill-amber-400 text-amber-400" : "text-white/70"
            )}
          />
        </Button>

        <span className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/80">
          {board.isPublic ? (
            <>
              <Globe className="h-3 w-3" /> Public
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" /> Private
            </>
          )}
        </span>
      </div>

      {/* Center: View Switcher (Kanban, Calendar, Table, Analytics) */}
      <div className="flex items-center rounded-lg bg-black/40 p-0.5 border border-white/10">
        {views.map((v) => {
          const Icon = v.icon;
          const isActive = activeView === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                isActive
                  ? "bg-white/20 text-white shadow-sm font-semibold"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Active Presence, Filters, Export */}
      <div className="flex items-center gap-2">
        {/* Presence Avatars */}
        <div className="flex -space-x-1.5 overflow-hidden">
          {presenceUsers.slice(0, 4).map((p) => (
            <Avatar key={p.socketId} className="h-6 w-6 ring-2 ring-black/40" title={p.userName}>
              <AvatarImage src={p.avatarUrl || ''} />
              <AvatarFallback className="bg-primary text-[10px] text-white">
                {p.userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>

        {/* Filter Popover */}
        <FilterPopover activeFiltersCount={activeFiltersCount} />

        {/* Export Button */}
        <Button
          variant="glass"
          size="sm"
          onClick={() => setIsExportOpen(true)}
          className="h-8 gap-1 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Export</span>
        </Button>
      </div>

      <ExportModal open={isExportOpen} onOpenChange={setIsExportOpen} board={board} />
    </div>
  );
}
