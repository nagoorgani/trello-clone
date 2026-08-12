'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trello, Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Successfully logged in!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@trello.dev');
    setPassword('Password123!');
    setLoading(true);
    try {
      await login({ email: 'demo@trello.dev', password: 'Password123!' });
      toast.success('Logged in as Alex Vance (Demo Lead)');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4 bg-gradient-to-br from-background via-background/95 to-primary/10">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-border/60 bg-card p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Trello className="h-6 w-6 fill-current" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Welcome Back
          </h1>
          <p className="text-xs text-muted-foreground">
            Sign in to access your boards, teams, and sprints.
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="flex w-full items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 p-3 text-xs font-semibold text-primary transition-all hover:bg-primary/15"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>1-Click Demo Login (Alex Vance)</span>
          </div>
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-10 rounded-xl font-bold shadow-md">
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
