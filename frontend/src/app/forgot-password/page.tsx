'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trello, Lock, Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res: any = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res?.resetToken) {
        setToken(res.resetToken);
        toast.success('Reset code generated! You can now set your new password.');
        setStep('reset');
      } else {
        toast.success(res?.message || 'If an account exists, a reset link has been dispatched.');
        setStep('reset');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to request reset token.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) return;

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
      });
      toast.success('Password updated successfully! You can now sign in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Invalid or expired reset token.');
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
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {step === 'request' ? 'Reset Password' : 'Enter New Password'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {step === 'request'
              ? 'Enter your account email to receive your password reset token.'
              : 'Choose a strong new password for your account.'}
          </p>
        </div>

        {step === 'request' ? (
          <form onSubmit={handleRequestToken} className="space-y-4">
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
                  autoFocus
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-10 rounded-xl font-bold shadow-md">
              {loading ? 'Generating Code...' : 'Continue to Reset Password'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Reset Verification Token</label>
              <Input
                placeholder="Enter reset token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-9"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-10 rounded-xl font-bold shadow-md">
              {loading ? 'Updating Password...' : 'Save New Password'}
            </Button>
          </form>
        )}

        {/* Back to Login */}
        <div className="text-center pt-2 border-t">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
