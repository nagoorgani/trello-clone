'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Plus,
  Trello,
  Menu,
  Check,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/lib/auth-store';
import { useUIStore } from '@/lib/ui-store';
import { useBoardStore } from '@/lib/board-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { api } from '@/lib/api';
import { Notification } from '@/types';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { setCommandPaletteOpen, toggleSidebar, setCreateBoardOpen, setAiModalOpen } =
    useUIStore();
  const { searchQuery, setSearchQuery } = useBoardStore();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const data: any = await api.get('/notifications');
      setNotifications(data || []);
      setUnreadCount((data || []).filter((n: Notification) => !n.isRead).length);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-md">
      {/* Left section: App Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={toggleSidebar}
        >
          <Menu className="h-4 w-4" />
        </Button>

        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Trello className="h-4 w-4 fill-current" />
          </div>
          <span className="hidden bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-base font-extrabold sm:inline-block">
            Trello<span className="text-primary">Pro</span>
          </span>
        </Link>
      </div>

      {/* Center section: Global Search & Cmd+K Trigger */}
      <div className="flex max-w-md flex-1 items-center px-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex h-8 w-full items-center justify-between rounded-lg border border-input bg-muted/40 px-3 text-xs text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search cards, boards, or actions...</span>
          </div>
          <kbd className="pointer-events-none hidden rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: AI Trigger, New Board, Notifications, Theme, User Menu */}
      <div className="flex items-center gap-2">
        {/* AI Assistant Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAiModalOpen(true)}
          className="relative hidden gap-1.5 border-primary/30 bg-primary/5 text-xs text-primary hover:bg-primary/10 sm:flex"
        >
          <Sparkles className="h-3.5 w-3.5 fill-primary/30" />
          <span>AI Copilot</span>
        </Button>

        {/* Quick Create Board Button */}
        <Button
          size="sm"
          onClick={() => setCreateBoardOpen(true)}
          className="h-8 gap-1 rounded-lg px-2.5 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Create</span>
        </Button>

        {/* Notifications Popover */}
        <Popover onOpenChange={(open) => open && fetchNotifications()}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b p-3">
              <h4 className="text-sm font-semibold">Notifications</h4>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No notifications yet ✨
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`mb-1 rounded-lg p-2 text-xs transition-colors ${
                      n.isRead ? 'bg-background' : 'bg-primary/5 font-medium'
                    }`}
                  >
                    <div className="font-semibold text-foreground">{n.title}</div>
                    <div className="text-muted-foreground">{n.message}</div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-yellow-400" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* User Menu */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full ring-offset-background transition-opacity hover:opacity-80 focus:outline-none">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.avatarUrl || ''} />
                  <AvatarFallback className="text-[10px]">
                    {user.name?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-semibold leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
