'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  AlignLeft,
  CheckSquare,
  Tag,
  Clock,
  User,
  Paperclip,
  MessageSquare,
  Sparkles,
  Trash2,
  Plus,
  Check,
  AlertCircle,
  Activity as ActivityIcon,
  Palette,
  Flag,
} from 'lucide-react';
import { useUIStore } from '@/lib/ui-store';
import { useBoardStore } from '@/lib/board-store';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { Card, CardPriority, Checklist, Label } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatDate, isOverdue, isDueSoon, cn } from '@/lib/utils';

const COVER_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

export function CardDetailsModal() {
  const { activeCardId, setActiveCardId } = useUIStore();
  const { board, updateCardLocally, deleteCardLocally } = useBoardStore();
  const { user } = useAuthStore();

  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);

  // Edit states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newItemTitle, setNewItemTitle] = useState<Record<string, string>>({});
  const [newComment, setNewComment] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fetch full card data when modal opens
  useEffect(() => {
    if (!activeCardId) {
      setCard(null);
      return;
    }

    setLoading(true);
    api.get(`/cards/${activeCardId}`)
      .then((data: any) => {
        setCard(data);
        setTitle(data.title);
        setDescription(data.description || '');
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeCardId]);

  if (!activeCardId) return null;

  const handleTitleBlur = async () => {
    if (!card || !title.trim() || title === card.title) return;
    updateCardLocally({ id: card.id, title: title.trim() });
    await api.patch(`/cards/${card.id}`, { title: title.trim() });
  };

  const handleSaveDescription = async () => {
    if (!card) return;
    setIsEditingDesc(false);
    updateCardLocally({ id: card.id, description });
    await api.patch(`/cards/${card.id}`, { description });
    setCard({ ...card, description });
  };

  const handleAiGenerateDescription = async () => {
    if (!card) return;
    setIsAiLoading(true);
    try {
      const data: any = await api.post('/ai/generate-description', {
        title: card.title,
      });
      if (data?.description) {
        setDescription(data.description);
        setIsEditingDesc(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSetCoverColor = async (color: string | null) => {
    if (!card) return;
    const updated = { ...card, coverColor: color };
    setCard(updated);
    updateCardLocally({ id: card.id, coverColor: color });
    await api.patch(`/cards/${card.id}`, { coverColor: color });
  };

  const handleSetPriority = async (priority: CardPriority) => {
    if (!card) return;
    const updated = { ...card, priority };
    setCard(updated);
    updateCardLocally({ id: card.id, priority });
    await api.patch(`/cards/${card.id}`, { priority });
  };

  const handleToggleCompletion = async () => {
    if (!card) return;
    const isCompleted = !card.isCompleted;
    const updated = { ...card, isCompleted };
    setCard(updated);
    updateCardLocally({ id: card.id, isCompleted });
    await api.patch(`/cards/${card.id}`, { isCompleted });

    if (isCompleted) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleToggleLabel = async (labelId: string) => {
    if (!card) return;
    const res: any = await api.post(`/cards/${card.id}/labels`, { labelId });
    // Refresh card
    const updatedCard: any = await api.get(`/cards/${card.id}`);
    setCard(updatedCard);
    updateCardLocally(updatedCard);
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card || !newChecklistTitle.trim()) return;

    const checklist: any = await api.post('/checklists', {
      cardId: card.id,
      title: newChecklistTitle.trim(),
    });

    setCard({
      ...card,
      checklists: [...(card.checklists || []), checklist],
    });
    setNewChecklistTitle('');
  };

  const handleAiGenerateChecklist = async () => {
    if (!card) return;
    setIsAiLoading(true);
    try {
      const data: any = await api.post('/ai/generate-checklist', {
        title: card.title,
        description: card.description || undefined,
      });

      if (data?.items && data.items.length > 0) {
        const checklist: any = await api.post('/checklists', {
          cardId: card.id,
          title: data.checklistTitle || 'AI Generated Subtasks',
        });

        for (const itemTitle of data.items) {
          await api.post(`/checklists/${checklist.id}/items`, {
            title: itemTitle,
          });
        }

        const updatedCard: any = await api.get(`/cards/${card.id}`);
        setCard(updatedCard);
        updateCardLocally(updatedCard);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddChecklistItem = async (checklistId: string) => {
    const itemTitle = newItemTitle[checklistId];
    if (!card || !itemTitle || !itemTitle.trim()) return;

    const item: any = await api.post(`/checklists/${checklistId}/items`, {
      title: itemTitle.trim(),
    });

    const updatedChecklists = (card.checklists || []).map((cl) => {
      if (cl.id === checklistId) {
        return { ...cl, items: [...(cl.items || []), item] };
      }
      return cl;
    });

    setCard({ ...card, checklists: updatedChecklists });
    setNewItemTitle((prev) => ({ ...prev, [checklistId]: '' }));
    updateCardLocally({ id: card.id, checklists: updatedChecklists });
  };

  const handleToggleChecklistItem = async (
    checklistId: string,
    itemId: string,
    currentStatus: boolean
  ) => {
    if (!card) return;
    const isCompleted = !currentStatus;

    const updatedChecklists = (card.checklists || []).map((cl) => {
      if (cl.id === checklistId) {
        return {
          ...cl,
          items: cl.items.map((it) =>
            it.id === itemId ? { ...it, isCompleted } : it
          ),
        };
      }
      return cl;
    });

    setCard({ ...card, checklists: updatedChecklists });
    updateCardLocally({ id: card.id, checklists: updatedChecklists });

    await api.patch(`/checklists/items/${itemId}`, { isCompleted });

    // Check if 100% complete
    const allItems = updatedChecklists.flatMap((c) => c.items);
    if (allItems.length > 0 && allItems.every((i) => i.isCompleted)) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    if (!card) return;
    await api.delete(`/checklists/${checklistId}`);
    const updated = (card.checklists || []).filter((cl) => cl.id !== checklistId);
    setCard({ ...card, checklists: updated });
    updateCardLocally({ id: card.id, checklists: updated });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card || !newComment.trim()) return;

    const comment: any = await api.post('/comments', {
      cardId: card.id,
      content: newComment.trim(),
    });

    setCard({
      ...card,
      comments: [comment, ...(card.comments || [])],
    });
    setNewComment('');
  };

  const handleDeleteCard = async () => {
    if (!card) return;
    deleteCardLocally(card.id);
    setActiveCardId(null);
    await api.delete(`/cards/${card.id}`);
  };

  // Progress metrics
  const allItems = (card?.checklists || []).flatMap((cl) => cl.items || []);
  const completedCount = allItems.filter((i) => i.isCompleted).length;
  const progressPercent =
    allItems.length > 0 ? Math.round((completedCount / allItems.length) * 100) : 0;

  return (
    <Dialog open={Boolean(activeCardId)} onOpenChange={(open) => !open && setActiveCardId(null)}>
      <DialogContent className="max-w-3xl w-[96vw] md:w-full p-0 overflow-hidden max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl">
        {/* Cover Header Bar */}
        {card?.coverColor && (
          <div
            className="h-20 sm:h-24 w-full transition-all duration-300 relative shrink-0"
            style={{ backgroundColor: card.coverColor }}
          >
            <button
              onClick={() => handleSetCoverColor(null)}
              className="absolute right-12 top-3 sm:top-4 rounded-full bg-black/40 p-1.5 text-white/80 hover:text-white"
              title="Remove Cover"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="p-4 sm:p-6 overflow-y-auto kanban-scrollbar space-y-5 sm:space-y-6 flex-1">
          {/* Card Title & List Breadcrumb */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={card?.isCompleted}
                onCheckedChange={handleToggleCompletion}
                className="h-5 w-5 rounded-md"
              />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="w-full bg-transparent text-xl font-bold tracking-tight text-foreground outline-none focus:ring-1 focus:ring-primary rounded px-1"
              />
            </div>
            <p className="text-xs text-muted-foreground pl-7">
              in list <span className="font-semibold text-foreground">{card?.list?.title || 'Active List'}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Main Details (3 cols) */}
            <div className="md:col-span-3 space-y-6">
              {/* Badges Bar (Labels, Due Date, Priority) */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                {/* Labels list */}
                {card?.labels && card.labels.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Labels</span>
                    <div className="flex flex-wrap gap-1.5">
                      {card.labels.map((cl) => (
                        <span
                          key={cl.id}
                          className="rounded-md px-2.5 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor: `${cl.label.color}25`,
                            color: cl.label.color,
                          }}
                        >
                          {cl.label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority Badge */}
                {card?.priority && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Priority</span>
                    <div>
                      <Badge variant={card.priority.toLowerCase() as any} className="capitalize">
                        {card.priority}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Due Date */}
                {card?.dueDate && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">Due Date</span>
                    <div className="flex items-center gap-1 font-medium text-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDate(card.dueDate)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <AlignLeft className="h-4 w-4 text-primary" />
                    <span>Description</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAiGenerateDescription}
                    disabled={isAiLoading}
                    className="h-7 gap-1 text-xs text-primary hover:text-primary"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Format</span>
                  </Button>
                </div>

                {isEditingDesc ? (
                  <div className="space-y-2">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a detailed markdown description..."
                      rows={5}
                      className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary font-mono"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveDescription} className="h-8 text-xs">
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingDesc(false)}
                        className="h-8 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingDesc(true)}
                    className="min-h-[80px] cursor-pointer rounded-xl border border-border/40 bg-muted/20 p-3 text-xs text-foreground transition-all hover:bg-muted/40 whitespace-pre-wrap font-sans"
                  >
                    {description ? (
                      description
                    ) : (
                      <span className="text-muted-foreground">Click to add a detailed description...</span>
                    )}
                  </div>
                )}
              </div>

              {/* Checklists Section */}
              <div className="space-y-4">
                {card?.checklists?.map((checklist) => {
                  const items = checklist.items || [];
                  const done = items.filter((i) => i.isCompleted).length;
                  const percent = items.length > 0 ? Math.round((done / items.length) * 100) : 0;

                  return (
                    <div key={checklist.id} className="space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                          <CheckSquare className="h-4 w-4 text-primary" />
                          <span>{checklist.title}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteChecklist(checklist.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                          <span>{percent}% Complete</span>
                          <span>
                            {done}/{items.length}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="space-y-1.5">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-accent/40 text-xs transition-colors"
                          >
                            <Checkbox
                              checked={item.isCompleted}
                              onCheckedChange={() =>
                                handleToggleChecklistItem(checklist.id, item.id, item.isCompleted)
                              }
                            />
                            <span
                              className={cn(
                                "flex-1 text-foreground",
                                item.isCompleted && "line-through text-muted-foreground"
                              )}
                            >
                              {item.title}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Add item input */}
                      <div className="flex gap-2 pt-1">
                        <Input
                          placeholder="Add an item..."
                          value={newItemTitle[checklist.id] || ''}
                          onChange={(e) =>
                            setNewItemTitle({
                              ...newItemTitle,
                              [checklist.id]: e.target.value,
                            })
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem(checklist.id)}
                          className="h-8 text-xs"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddChecklistItem(checklist.id)}
                          className="h-8 text-xs font-semibold shrink-0"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* AI Subtask Generator Shortcut */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAiGenerateChecklist}
                  disabled={isAiLoading}
                  className="w-full gap-2 border-dashed border-primary/40 bg-primary/5 text-xs text-primary hover:bg-primary/10"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isAiLoading ? 'Decomposing task with AI...' : 'Auto-Generate Subtasks with AI'}</span>
                </Button>
              </div>

              {/* Comments & Discussion */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span>Activity & Comments</span>
                </div>

                <form onSubmit={handleAddComment} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl || ''} />
                    <AvatarFallback className="text-[10px] bg-primary text-white">
                      {user?.name.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-input bg-card p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newComment.trim()}
                      className="h-7 text-xs font-semibold"
                    >
                      Comment
                    </Button>
                  </div>
                </form>

                {/* Comments Feed */}
                <div className="space-y-3 pt-2">
                  {card?.comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-3 text-xs">
                      <Avatar className="h-7 w-7 mt-0.5">
                        <AvatarImage src={comment.user.avatarUrl || ''} />
                        <AvatarFallback className="text-[9px] bg-muted">
                          {comment.user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1 rounded-xl bg-muted/40 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{comment.user.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Actions (1 col) */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Add to Card
              </span>

              {/* Labels Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                    <Tag className="h-3.5 w-3.5 text-primary" />
                    <span>Labels</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-3 space-y-2">
                  <span className="text-xs font-bold text-foreground">Select Labels</span>
                  <div className="space-y-1">
                    {board?.labels?.map((label) => {
                      const isAttached = card?.labels?.some((cl) => cl.labelId === label.id);
                      return (
                        <button
                          key={label.id}
                          onClick={() => handleToggleLabel(label.id)}
                          className="flex w-full items-center justify-between rounded-lg p-1.5 text-xs font-semibold transition-all hover:opacity-90"
                          style={{
                            backgroundColor: `${label.color}25`,
                            color: label.color,
                          }}
                        >
                          <span>{label.name}</span>
                          {isAttached && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Cover Color Picker Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                    <Palette className="h-3.5 w-3.5 text-purple-500" />
                    <span>Cover</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-3 space-y-2">
                  <span className="text-xs font-bold text-foreground">Cover Color</span>
                  <div className="grid grid-cols-4 gap-2">
                    {COVER_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleSetCoverColor(c)}
                        className="h-8 rounded-lg transition-transform hover:scale-105"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  {card?.coverColor && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetCoverColor(null)}
                      className="w-full text-xs text-muted-foreground"
                    >
                      Remove Cover
                    </Button>
                  )}
                </PopoverContent>
              </Popover>

              {/* Priority Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                    <Flag className="h-3.5 w-3.5 text-amber-500" />
                    <span>Priority</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-48 p-2 space-y-1">
                  {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as CardPriority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => handleSetPriority(p)}
                      className="flex w-full items-center justify-between rounded-md p-1.5 text-xs font-medium hover:bg-accent capitalize"
                    >
                      <span>{p.toLowerCase()}</span>
                      {card?.priority === p && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* Add Checklist Form */}
              <form onSubmit={handleAddChecklist} className="space-y-1 pt-2">
                <Input
                  placeholder="New checklist..."
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={!newChecklistTitle.trim()}
                  className="w-full justify-start gap-2 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Checklist</span>
                </Button>
              </form>

              {/* Actions Divider */}
              <div className="pt-4 border-t space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Actions
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteCard}
                  className="w-full justify-start gap-2 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Card</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
