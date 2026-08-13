'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import {
  Layout,
  Star,
  Plus,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Compass,
} from 'lucide-react';
import { useUIStore } from '@/lib/ui-store';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { Board, Workspace } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const currentBoardId = params?.id as string;
  const { user } = useAuthStore();
  const { isSidebarCollapsed, setCreateBoardOpen, toggleSidebar } = useUIStore();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;
    api.get('/workspaces')
      .then((data: any) => {
        setWorkspaces(data || []);
        // Automatically expand first workspace
        if (data && data.length > 0) {
          setExpandedWorkspaces((prev) => ({ ...prev, [data[0].id]: true }));
        }
      })
      .catch(() => {});
  }, [user]);

  const toggleExpand = (wsId: string) => {
    setExpandedWorkspaces((prev) => ({
      ...prev,
      [wsId]: !prev[wsId],
    }));
  };

  // Collect all starred boards across workspaces
  const starredBoards: Board[] = [];
  workspaces.forEach((ws) => {
    (ws.boards || []).forEach((b) => {
      if (b.stars && b.stars.length > 0) {
        starredBoards.push(b);
      }
    });
  });

  if (isSidebarCollapsed) {
    return null;
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        onClick={() => toggleSidebar()}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
      />

      {/* Sidebar Panel */}
      <aside className="fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r border-border/60 bg-background/95 p-0 backdrop-blur-xl shadow-2xl md:static md:z-30 md:h-[calc(100vh-3.5rem)] md:w-64 md:bg-background/50 md:shadow-none transition-all duration-200">
        <div className="flex-1 overflow-y-auto p-3 space-y-6 kanban-scrollbar">
          {/* Quick Navigation links */}
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  toggleSidebar();
                }
              }}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                pathname === '/'
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Compass className="h-4 w-4" />
              <span>Overview & Dashboard</span>
            </Link>
          </div>

        {/* Starred Boards Section */}
        {starredBoards.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>Starred Boards</span>
              </div>
            </div>
            <div className="space-y-0.5">
              {starredBoards.map((b) => (
                <Link
                  key={b.id}
                  href={`/boards/${b.id}`}
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      toggleSidebar();
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors",
                    currentBoardId === b.id
                      ? "bg-accent font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: b.backgroundValue.includes('linear-gradient')
                        ? '#6366f1'
                        : b.backgroundValue,
                    }}
                  />
                  <span className="truncate">{b.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Workspaces & Boards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Workspaces</span>
          </div>

          <div className="space-y-2">
            {workspaces.map((ws) => {
              const isExpanded = expandedWorkspaces[ws.id] ?? true;
              return (
                <div key={ws.id} className="space-y-1">
                  <div className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold hover:bg-accent/50">
                    <button
                      onClick={() => toggleExpand(ws.id)}
                      className="flex flex-1 items-center gap-2 text-left truncate"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <Briefcase className="h-3.5 w-3.5 text-primary" />
                      <span className="truncate">{ws.name}</span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setCreateBoardOpen(true)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="ml-4 space-y-0.5 border-l border-border/40 pl-2">
                      {(ws.boards || []).map((board) => (
                        <Link
                          key={board.id}
                          href={`/boards/${board.id}`}
                          onClick={() => {
                            if (typeof window !== 'undefined' && window.innerWidth < 768) {
                              toggleSidebar();
                            }
                          }}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                            currentBoardId === board.id
                              ? "bg-primary/10 font-semibold text-primary"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          )}
                        >
                          <Layers className="h-3.5 w-3.5 shrink-0 opacity-70" />
                          <span className="truncate">{board.title}</span>
                        </Link>
                      ))}

                      <button
                        onClick={() => setCreateBoardOpen(true)}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add board</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="border-t border-border/40 p-3">
        <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Layout className="h-3.5 w-3.5 text-primary" />
            <span>Trello Clone Pro</span>
          </div>
          <p className="mt-1 text-[11px]">Next.js + NestJS Real-time</p>
        </div>
      </div>
    </aside>
    </>
  );
}
