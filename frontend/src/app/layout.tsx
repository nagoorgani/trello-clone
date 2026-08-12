import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { CreateBoardModal } from '@/components/layout/CreateBoardModal';
import { AiAssistantModal } from '@/components/layout/AiAssistantModal';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Trello Clone Pro | Production-Ready Project Management',
  description:
    'Full-stack real-time project collaboration platform with Kanban, Calendar, Table, and AI assistance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden relative">
              {children}
            </main>
          </div>

          <CommandPalette />
          <CreateBoardModal />
          <AiAssistantModal />
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
