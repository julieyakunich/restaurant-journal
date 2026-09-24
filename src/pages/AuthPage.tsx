import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Mail, Lock, User, Loader2, CheckCircle2, Compass } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/cn';

type Mode = 'signin' | 'signup';

export function AuthPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const signInAsGuest = useAuthStore((s) => s.signInAsGuest);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [mode, setMode] = useState<Mode>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [guestBusy, setGuestBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    clearError();
    setConfirmSent(false);
  }

  async function onGuest() {
    if (guestBusy || busy) return;
    setGuestBusy(true);
    clearError();
    try {
      const ok = await signInAsGuest();
      if (ok) navigate('/', { replace: true });
    } finally {
      setGuestBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { ok, needsEmailConfirm } = await signUp(
          email.trim(),
          password,
          displayName.trim(),
        );
        if (ok && needsEmailConfirm) {
          setConfirmSent(true);
          return;
        }
        if (ok) {
          navigate('/onboarding', { replace: true });
        }
      } else {
        const ok = await signIn(email.trim(), password);
        if (ok) navigate('/', { replace: true });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 rounded-2xl bg-brand-600 p-3 text-white">
            <Utensils className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Restaurant Journal
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Find restaurants you can trust while travelling with food allergies.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {/* mode toggle */}
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  'rounded-lg py-2 text-sm font-semibold transition',
                  mode === m
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {confirmSent ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden />
              <p className="font-semibold text-slate-900">Check your email</p>
              <p className="text-sm text-slate-500">
                We sent a confirmation link to <strong>{email}</strong>. Confirm it,
                then come back and sign in.
              </p>
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="mt-2 text-sm font-semibold text-brand-700 hover:underline"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              {mode === 'signup' && (
                <Field
                  Icon={User}
                  label="Name"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={setDisplayName}
                  placeholder="What should we call you?"
                  required
                />
              )}
              <Field
                Icon={Mail}
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                required
              />
              <Field
                Icon={Lock}
                label="Password"
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={setPassword}
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                minLength={6}
                required
              />

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          )}

          {!confirmSent && (
            <>
              <div className="my-4 flex items-center gap-3 text-xs font-medium text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                or
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <button
                type="button"
                onClick={onGuest}
                disabled={busy || guestBusy}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {guestBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Compass className="h-4 w-4" aria-hidden />
                )}
                Browse without an account
              </button>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          {mode === 'signin'
            ? 'New here? Switch to “Create account” above.'
            : 'Already have an account? Switch to “Sign in” above.'}
        </p>
      </div>
    </div>
  );
}

function Field({
  Icon,
  label,
  value,
  onChange,
  ...rest
}: {
  Icon: typeof Mail;
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        <input
          {...rest}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
        />
      </span>
    </label>
  );
}
