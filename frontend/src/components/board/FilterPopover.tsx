'use client';

import React from 'react';
import { Filter, X, Check } from 'lucide-react';
import { useBoardStore } from '@/lib/board-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CardPriority } from '@/types';

export function FilterPopover({ activeFiltersCount }: { activeFiltersCount: number }) {
  const {
    board,
    searchQuery,
    setSearchQuery,
    filterLabels,
    setFilterLabels,
    filterPriority,
    setFilterPriority,
    clearFilters,
  } = useBoardStore();

  const toggleLabel = (labelId: string) => {
    if (filterLabels.includes(labelId)) {
      setFilterLabels(filterLabels.filter((id) => id !== labelId));
    } else {
      setFilterLabels([...filterLabels, labelId]);
    }
  };

  const priorities: CardPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="glass"
          size="sm"
          className="h-8 gap-1.5 text-xs text-white"
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Filter</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-0.5 h-4 px-1.5 text-[10px] bg-white/30 text-white">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4 space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="text-sm font-semibold">Filter Cards</h4>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter by keyword */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Keyword</label>
          <input
            type="text"
            placeholder="Search in card titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filter by Labels */}
        {board?.labels && board.labels.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Labels</label>
            <div className="flex flex-wrap gap-1.5">
              {board.labels.map((l) => {
                const isSelected = filterLabels.includes(l.id);
                return (
                  <button
                    key={l.id}
                    onClick={() => toggleLabel(l.id)}
                    className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-all"
                    style={{
                      backgroundColor: `${l.color}20`,
                      color: l.color,
                      border: `1px solid ${l.color}${isSelected ? 'ff' : '40'}`,
                    }}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    <span>{l.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter by Priority */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Priority</label>
          <div className="grid grid-cols-2 gap-1.5">
            {priorities.map((p) => {
              const isSelected = filterPriority === p;
              return (
                <button
                  key={p}
                  onClick={() => setFilterPriority(isSelected ? null : p)}
                  className={`flex items-center justify-between rounded-md border px-2 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-input hover:bg-accent'
                  }`}
                >
                  <span>{p}</span>
                  {isSelected && <Check className="h-3 w-3 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
