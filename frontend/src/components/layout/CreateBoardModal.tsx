'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles } from 'lucide-react';
import { useUIStore } from '@/lib/ui-store';
import { api } from '@/lib/api';
import { Workspace } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BACKGROUND_PRESETS = [
  {
    name: 'Midnight Nebula',
    value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
    preview: 'from-slate-900 via-indigo-950 to-purple-950',
  },
  {
    name: 'Ocean Depths',
    value: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f766e 100%)',
    preview: 'from-slate-900 via-emerald-950 to-teal-700',
  },
  {
    name: 'Sunset Glow',
    value: 'linear-gradient(135deg, #1e1b4b 0%, #831843 50%, #7c2d12 100%)',
    preview: 'from-indigo-950 via-pink-950 to-orange-900',
  },
  {
    name: 'Linear Dark',
    value: '#0f172a',
    preview: 'bg-slate-900',
  },
  {
    name: 'Royal Sapphire',
    value: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    preview: 'from-blue-900 to-blue-500',
  },
  {
    name: 'Emerald Matrix',
    value: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
    preview: 'from-emerald-900 to-emerald-500',
  },
];

export function CreateBoardModal() {
  const router = useRouter();
  const { isCreateBoardOpen, setCreateBoardOpen } = useUIStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [backgroundValue, setBackgroundValue] = useState(BACKGROUND_PRESETS[0].value);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isCreateBoardOpen) {
      api.get('/workspaces')
        .then((data: any) => {
          setWorkspaces(data || []);
          if (data && data.length > 0) {
            setWorkspaceId(data[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isCreateBoardOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !workspaceId) return;

    setLoading(true);
    try {
      const board: any = await api.post('/boards', {
        workspaceId,
        title: title.trim(),
        description: description.trim() || undefined,
        backgroundType: 'gradient',
        backgroundValue,
      });

      setCreateBoardOpen(false);
      setTitle('');
      setDescription('');
      router.push(`/boards/${board.id}`);
    } catch (err) {
      console.error('Failed to create board:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isCreateBoardOpen} onOpenChange={setCreateBoardOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Create Board</span>
          </DialogTitle>
          <DialogDescription>
            Boards are where projects and ideas come to life.
          </DialogDescription>
        </DialogHeader>

        {/* Board Preview Card */}
        <div
          className="relative flex h-28 w-full items-center justify-center rounded-xl p-4 text-center font-bold text-white shadow-inner transition-all duration-300"
          style={{ background: backgroundValue }}
        >
          <span className="text-base drop-shadow-md">
            {title.trim() || 'Board Title Preview'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Board Title <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Q3 Roadmap & Product Launch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Workspace
            </label>
            <select
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Background Theme
            </label>
            <div className="grid grid-cols-6 gap-2">
              {BACKGROUND_PRESETS.map((preset) => {
                const isSelected = backgroundValue === preset.value;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setBackgroundValue(preset.value)}
                    className="relative h-10 rounded-lg shadow-sm ring-offset-background transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{ background: preset.value }}
                    title={preset.name}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                        <Check className="h-4 w-4 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateBoardOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? 'Creating...' : 'Create Board'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
