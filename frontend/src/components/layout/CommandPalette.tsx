'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layout,
  Plus,
  Sparkles,
  Search,
  CheckSquare,
  Calendar,
  BarChart3,
  Table,
  Columns,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useUIStore } from '@/lib/ui-store';
import { useBoardStore } from '@/lib/board-store';
import { api } from '@/lib/api';
import { Board } from '@/types';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';

export function CommandPalette() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setActiveView,
    setCreateBoardOpen,
    setAiModalOpen,
  } = useUIStore();
  const { board } = useBoardStore();

  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      api.get('/workspaces')
        .then((wsList: any) => {
          const allBoards: Board[] = [];
          (wsList || []).forEach((ws: any) => {
            (ws.boards || []).forEach((b: any) => allBoards.push(b));
          });
          setBoards(allBoards);
        })
        .catch(() => {});
    }
  }, [isCommandPaletteOpen]);

  const runCommand = (action: () => void) => {
    setCommandPaletteOpen(false);
    action();
  };

  return (
    <CommandDialog
      open={isCommandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
    >
      <CommandInput placeholder="Type a command or search boards..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() =>
              runCommand(() => setCreateBoardOpen(true))
            }
          >
            <Plus className="mr-2 h-4 w-4 text-primary" />
            <span>Create New Board</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => setAiModalOpen(true))
            }
          >
            <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
            <span>Open AI Copilot</span>
          </CommandItem>
        </CommandGroup>

        {board && (
          <CommandGroup heading="Switch View">
            <CommandItem
              onSelect={() => runCommand(() => setActiveView('kanban'))}
            >
              <Columns className="mr-2 h-4 w-4" />
              <span>Kanban Board View</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setActiveView('calendar'))}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar Due Dates View</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setActiveView('table'))}
            >
              <Table className="mr-2 h-4 w-4" />
              <span>Table / Spreadsheet View</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setActiveView('analytics'))}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Analytics & Metrics Dashboard</span>
            </CommandItem>
          </CommandGroup>
        )}

        <CommandGroup heading="Boards">
          {boards.map((b) => (
            <CommandItem
              key={b.id}
              onSelect={() =>
                runCommand(() => router.push(`/boards/${b.id}`))
              }
            >
              <Layout className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{b.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Theme">
          <CommandItem
            onSelect={() =>
              runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))
            }
          >
            {theme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="mr-2 h-4 w-4 text-indigo-400" />
            )}
            <span>Toggle Theme (Dark / Light)</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
