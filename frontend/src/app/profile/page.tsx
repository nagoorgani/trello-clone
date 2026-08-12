'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Save, Camera, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatarUrl || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated: any = await api.patch('/users/profile', {
        name,
        avatarUrl: avatarUrl || undefined,
        bio: bio || undefined,
      });
      setUser(updated);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setPasswordLoading(true);
    try {
      await api.post('/users/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto space-y-8 kanban-scrollbar">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile & Account Settings</h1>
        <p className="text-xs text-muted-foreground">Manage your identity, personal info, and security credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24 ring-4 ring-primary/20">
            <AvatarImage src={avatarUrl || ''} />
            <AvatarFallback className="text-xl font-bold bg-primary text-white">
              {name.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-lg font-bold text-foreground">{name || 'User'}</h2>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          <div className="w-full rounded-2xl bg-muted/40 p-3 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Email Verified</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Your account is fully active with complete permissions.</p>
          </div>
        </div>

        {/* Edit Forms (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* General Information */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">Personal Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Avatar Image URL</label>
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Bio</label>
                <textarea
                  placeholder="Tell your team about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </form>
          </div>

          {/* Security & Password */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <Button type="submit" variant="secondary" disabled={passwordLoading} className="gap-2">
                <Lock className="h-4 w-4" />
                <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
