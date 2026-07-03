'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { LogOut, User, Sparkles, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Image from 'next/image';
import Toggle from '@/components/ui/Toggle';
import { TAG_CATEGORIES } from '@/types';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Preference states
  const [preferredPartySize, setPreferredPartySize] = useState<2 | 3 | 4>(2);
  const [hardLimits, setHardLimits] = useState<string[]>([]);
  const [participantNames, setParticipantNames] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'loading') return;

    async function loadProfile() {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        const prof = data.profile;

        setPreferredPartySize(prof.preferredPartySize || 2);
        setHardLimits(prof.hardLimits || []);
        setParticipantNames(prof.participantNames || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      loadProfile();
    } else {
      // Load from localStorage for guest
      try {
        const size = localStorage.getItem('reveal_guestPartySize');
        setPreferredPartySize(size ? (parseInt(size, 10) as 2 | 3 | 4) : 2);

        const limits = localStorage.getItem('reveal_guestLimits');
        setHardLimits(limits ? JSON.parse(limits) : []);

        const name = localStorage.getItem('reveal_guestName') || '';
        setParticipantNames([name]);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
  }, [status]);

  const handleToggleLimit = (tag: string) => {
    if (hardLimits.includes(tag)) {
      setHardLimits(hardLimits.filter((t) => t !== tag));
    } else {
      setHardLimits([...hardLimits, tag]);
    }
  };

  const handleNameChange = (index: number, name: string) => {
    const updated = [...participantNames];
    while (updated.length < preferredPartySize) {
      updated.push('');
    }
    updated[index] = name;
    setParticipantNames(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const finalNames = participantNames.slice(0, preferredPartySize).map((name, idx) => {
        if (name.trim()) return name.trim();
        return idx === 0
          ? session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('reveal_guestName') || 'Guest 1' : 'Guest 1')
          : `Player ${idx + 1}`;
      });

      if (status === 'authenticated') {
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferredPartySize,
            hardLimits,
            participantNames: finalNames,
          }),
        });

        if (!res.ok) throw new Error('Failed to save settings');
      } else {
        // Save to localStorage for guest
        localStorage.setItem('reveal_guestPartySize', preferredPartySize.toString());
        localStorage.setItem('reveal_guestLimits', JSON.stringify(hardLimits));
        if (finalNames[0]) {
          localStorage.setItem('reveal_guestName', finalNames[0]);
        }
      }
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      console.error(e);
      setMessage('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-surface font-sans text-xs uppercase tracking-widest text-muted animate-pulse">
        Loading preferences...
      </div>
    );
  }

  const allBoundaryTags = Object.values(TAG_CATEGORIES).flat();

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col gap-6 p-6 bg-surface max-w-2xl mx-auto font-sans">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-gradient uppercase font-sans">
          Preferences & Account
        </h1>
        <p className="text-muted text-xs uppercase tracking-widest font-sans font-semibold">
          Manage your boundaries, players, and session configurations
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Account Info Card */}
        <Card glow="primary" hover={false} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User Profile'}
                className="w-12 h-12 rounded-full border border-secondary/30 shadow-glow-gold object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center text-muted border border-primary/20">
                <User className="w-5 h-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-contrast uppercase tracking-wide">
                {session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('reveal_guestName') || 'Guest Explorer' : 'Guest Explorer')}
              </span>
              <span className="text-xs text-muted font-light">{session?.user?.email || 'Device-Locked Guest Session'}</span>
            </div>
          </div>

          {status === 'authenticated' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="flex items-center gap-1.5 font-bold text-danger hover:bg-danger/10 border-danger/10 w-full sm:w-auto justify-center sm:justify-start"
              icon={<LogOut className="w-3.5 h-3.5" />}
            >
              Sign Out
            </Button>
          ) : (
            <Link href="/">
              <Button
                variant="primary"
                size="sm"
                className="flex items-center gap-1.5 font-bold w-full sm:w-auto justify-center sm:justify-start"
              >
                Sign In with Google
              </Button>
            </Link>
          )}
        </Card>

        {/* Preference Settings Form */}
        <Card glow="none" hover={false} className="p-6 flex flex-col gap-6 bg-surface-light border-surface-elevated">
          {/* Party Size */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Standard Party Size</span>
            </span>
            <div className="flex gap-2 mt-1">
              {[2, 3, 4].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPreferredPartySize(size as 2 | 3 | 4)}
                  className={`px-4 py-2 text-xs font-bold rounded-full border transition-all ${
                    preferredPartySize === size
                      ? 'bg-primary border-primary text-contrast shadow-glow'
                      : 'bg-surface border-surface-elevated text-muted'
                  }`}
                >
                  {size} Players
                </button>
              ))}
            </div>
          </div>

          {/* Participant Names */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Participant Names
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              {Array.from({ length: preferredPartySize }).map((_, idx) => (
                <Input
                  key={idx}
                  label={`Player ${idx + 1}`}
                  value={participantNames[idx] || (idx === 0 ? session?.user?.name || '' : '')}
                  onChange={(e) => handleNameChange(idx, e.target.value)}
                  placeholder={`Player ${idx + 1}'s name`}
                />
              ))}
            </div>
          </div>

          {/* Hard Limits / Exclusions */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Hard Boundaries (Filtered Out)</span>
            </span>
            <div className="flex flex-wrap gap-2 mt-1 max-h-48 overflow-y-auto pr-1">
              {allBoundaryTags.map((tag) => {
                const active = hardLimits.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleLimit(tag)}
                    className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full border transition-all ${
                      active
                        ? 'bg-danger/10 border-danger text-danger'
                        : 'bg-surface border-surface-elevated text-muted hover:text-contrast'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between border-t border-surface-elevated/40 pt-4 mt-2">
            <span className={`text-xs font-semibold ${message.includes('Error') ? 'text-danger' : 'text-success'}`}>
              {message}
            </span>
            <Button variant="primary" size="md" onClick={handleSave} loading={saving}>
              Save Preferences
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
