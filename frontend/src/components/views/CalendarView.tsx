'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useBoardStore } from '@/lib/board-store';
import { useUIStore } from '@/lib/ui-store';
import { Card } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CalendarView() {
  const { board } = useBoardStore();
  const { setActiveCardId } = useUIStore();

  const [currentDate, setCurrentDate] = useState(new Date());

  if (!board || !board.lists) return null;

  // Flatten all cards with due dates
  const allCards = board.lists.flatMap((l) => l.cards || []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map cards to day numbers
  const cardsByDay = new Map<number, Card[]>();
  allCards.forEach((card) => {
    if (card.dueDate) {
      const d = new Date(card.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        const existing = cardsByDay.get(day) || [];
        existing.push(card);
        cardsByDay.set(day, existing);
      }
    }
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {/* Calendar Header & Month Navigation */}
      <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-card p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-lg text-foreground">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <span>{monthName}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="h-8 text-xs font-semibold"
          >
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((wd) => (
          <div
            key={wd}
            className="py-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            {wd}
          </div>
        ))}

        {/* Blank days before start of month */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`blank-${i}`} className="min-h-[100px] rounded-xl border border-transparent bg-muted/10 p-2" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayCards = cardsByDay.get(day) || [];
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={day}
              className={cn(
                "min-h-[110px] rounded-xl border border-border/60 bg-card/80 p-2 shadow-sm transition-all hover:border-primary/40",
                isToday && "ring-2 ring-primary bg-primary/5"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {day}
                </span>
                {dayCards.length > 0 && (
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {dayCards.length} {dayCards.length === 1 ? 'task' : 'tasks'}
                  </span>
                )}
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[80px] kanban-scrollbar">
                {dayCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => setActiveCardId(card.id)}
                    className="cursor-pointer truncate rounded-md bg-muted/60 px-1.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-primary/20 hover:text-primary"
                    title={card.title}
                  >
                    {card.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
