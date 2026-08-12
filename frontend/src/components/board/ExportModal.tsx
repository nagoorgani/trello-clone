'use client';

import React from 'react';
import { Download, FileJson, FileSpreadsheet, Printer } from 'lucide-react';
import { Board } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ExportModal({
  open,
  onOpenChange,
  board,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: Board | null;
}) {
  if (!board) return null;

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(board, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${board.title.replace(/\s+/g, '_')}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    const rows = [['List', 'Card Title', 'Priority', 'Due Date', 'Checklist Items', 'Labels']];

    (board.lists || []).forEach((list) => {
      (list.cards || []).forEach((card) => {
        const checklistCount = (card.checklists || []).reduce((acc, cl) => acc + (cl.items?.length || 0), 0);
        const labels = (card.labels || []).map((l) => l.label?.name).join('; ');
        rows.push([
          `"${list.title.replace(/"/g, '""')}"`,
          `"${card.title.replace(/"/g, '""')}"`,
          card.priority,
          card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '',
          String(checklistCount),
          `"${labels}"`,
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `${board.title.replace(/\s+/g, '_')}_cards.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <span>Export Board Data</span>
          </DialogTitle>
          <DialogDescription>
            Download your boards, lists, and tasks in standard formats.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 py-2">
          <Button
            variant="outline"
            onClick={exportJSON}
            className="flex h-16 items-center justify-start gap-4 px-4 hover:border-primary/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <FileJson className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Export as JSON</div>
              <div className="text-xs text-muted-foreground">Full board schema and relations for backup</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={exportCSV}
            className="flex h-16 items-center justify-start gap-4 px-4 hover:border-primary/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Export as CSV</div>
              <div className="text-xs text-muted-foreground">Tabular card list for Excel and Google Sheets</div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={handlePrintPDF}
            className="flex h-16 items-center justify-start gap-4 px-4 hover:border-primary/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <Printer className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Print / Save as PDF</div>
              <div className="text-xs text-muted-foreground">Clean printable snapshot layout</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
