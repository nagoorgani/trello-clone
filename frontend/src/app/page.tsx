'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Star,
  Layers,
  Sparkles,
  ArrowRight,
  Briefcase,
  Activity as ActivityIcon,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useUIStore } from '@/lib/ui-store';
import { api } from '@/lib/api';
import { Board, Workspace } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const router = useRouter();
  const { user, initAuth, isLoading: authLoading } = useAuthStore();
  const { setCreateBoardOpen, setAiModalOpen } = useUIStore();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      api.get('/workspaces')
        .then((data: any) => {
          setWorkspaces(data || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || (loading && user)) {
    return (
      <div className="flex-1 p-8 space-y-8">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Collect all boards
  const allBoards = workspaces.flatMap((w) => w.boards || []);
  const starredBoards = allBoards.filter((b) => b.stars && b.stars.length > 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 kanban-scrollbar">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-primary/20 via-background to-purple-500/10 p-8 shadow-sm backdrop-blur-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Real-Time Workspace Active</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Welcome back, {user?.name || 'Explorer'} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your sprints, streamline team collaboration, and organize complex projects with high-performance Kanban boards.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={() => setCreateBoardOpen(true)}
              className="h-10 gap-2 rounded-xl px-5 text-xs font-semibold shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Board</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setAiModalOpen(true)}
              className="h-10 gap-2 rounded-xl px-5 text-xs font-semibold border-primary/30 text-primary"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Copilot</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Starred Boards Section */}
      {starredBoards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <h2>Starred Boards</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {starredBoards.map((board) => (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="group relative flex h-36 flex-col justify-between overflow-hidden rounded-2xl p-5 text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{
                  background: board.backgroundValue.includes('linear-gradient')
                    ? board.backgroundValue
                    : board.backgroundValue || '#1e293b',
                }}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-base tracking-tight drop-shadow">
                    {board.title}
                  </h3>
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex items-center justify-between text-xs text-white/80 font-medium">
                  <span>Open board</span>
                  <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Workspaces and Boards */}
      <div className="space-y-8">
        {workspaces.map((ws) => (
          <div key={ws.id} className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Briefcase className="h-5 w-5 text-primary" />
                <h2>{ws.name}</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCreateBoardOpen(true)}
                className="gap-1.5 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Board</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(ws.boards || []).map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className="group relative flex h-36 flex-col justify-between overflow-hidden rounded-2xl p-5 text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                  style={{
                    background: board.backgroundValue.includes('linear-gradient')
                      ? board.backgroundValue
                      : board.backgroundValue || '#1e293b',
                  }}
                >
                  <h3 className="font-bold text-base tracking-tight drop-shadow truncate">
                    {board.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-white/80 font-medium">
                    <span>View project</span>
                    <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}

              {/* Create Board Tile */}
              <button
                onClick={() => setCreateBoardOpen(true)}
                className="flex h-36 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-5 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/50 hover:bg-muted/40 hover:text-foreground"
              >
                <Plus className="h-6 w-6 text-primary" />
                <span>Create new board</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
