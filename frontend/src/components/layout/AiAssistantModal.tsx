'use client';

import React, { useState } from 'react';
import { Sparkles, Check, Copy, ListPlus, FileText } from 'lucide-react';
import { useUIStore } from '@/lib/ui-store';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AiAssistantModal() {
  const { isAiModalOpen, setAiModalOpen } = useUIStore();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedChecklist, setGeneratedChecklist] = useState<string[]>([]);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateChecklist = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const data: any = await api.post('/ai/generate-checklist', {
        title: prompt,
      });
      setGeneratedChecklist(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const data: any = await api.post('/ai/generate-description', {
        title: prompt,
      });
      setGeneratedDescription(data.description || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isAiModalOpen} onOpenChange={setAiModalOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5 fill-primary/20" />
            <span>AI Copilot & Task Architect</span>
          </DialogTitle>
          <DialogDescription>
            Decompose features into actionable checklists and generate structured user stories.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">
              Feature or Task Concept
            </label>
            <Input
              placeholder="e.g. Implement OAuth2 Google Authentication & Session Revocation"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              autoFocus
            />
          </div>

          <Tabs defaultValue="checklist" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="checklist" className="gap-1.5">
                <ListPlus className="h-3.5 w-3.5" />
                <span>Checklist Generator</span>
              </TabsTrigger>
              <TabsTrigger value="story" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>Structured Story</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="checklist" className="space-y-3 pt-2">
              <Button
                onClick={handleGenerateChecklist}
                disabled={loading || !prompt.trim()}
                className="w-full gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {loading ? 'Analyzing & generating...' : 'Generate Actionable Subtasks'}
              </Button>

              {generatedChecklist.length > 0 && (
                <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      Generated Subtasks ({generatedChecklist.length})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          generatedChecklist.map((i) => `- [ ] ${i}`).join('\n')
                        )
                      }
                      className="h-7 text-xs gap-1"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Copied' : 'Copy markdown'}
                    </Button>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {generatedChecklist.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {idx + 1}
                        </span>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="story" className="space-y-3 pt-2">
              <Button
                onClick={handleGenerateDescription}
                disabled={loading || !prompt.trim()}
                className="w-full gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {loading ? 'Formatting user story...' : 'Generate User Story Template'}
              </Button>

              {generatedDescription && (
                <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      Structured Markdown Story
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedDescription)}
                      className="h-7 text-xs gap-1"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-background p-2.5 text-xs font-mono text-muted-foreground">
                    {generatedDescription}
                  </pre>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
