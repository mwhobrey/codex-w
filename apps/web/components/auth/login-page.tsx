'use client';

import { signIn, signUp } from '@/lib/auth-client';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@codex/ui';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

type Mode = 'sign-in' | 'sign-up';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/characters';

  const [mode, setMode] = useState<Mode>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'sign-up') {
        const result = await signUp.email({
          name: name.trim() || email.split('@')[0] || 'Player',
          email,
          password,
        });
        if (result.error) {
          setError(result.error.message ?? 'Sign up failed');
          return;
        }
      } else {
        const result = await signIn.email({ email, password });
        if (result.error) {
          setError(result.error.message ?? 'Sign in failed');
          return;
        }
      }
      router.push(redirect);
      router.refresh();
    } catch {
      setError('Something went wrong. Is cloud auth configured?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="font-display text-2xl">
          {mode === 'sign-in' ? 'Sign in' : 'Create account'}
        </CardTitle>
        <CardDescription>
          Cloud backup for characters when signed in. Local play works offline without an account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'sign-up' && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm text-muted-foreground">
                Display name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mike"
                autoComplete="name"
              />
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-muted-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-muted-foreground">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8+ characters"
              autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
              minLength={8}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Working…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
        <div
          className="mt-6 flex rounded-md border border-border/50 p-0.5"
          role="tablist"
          aria-label="Account mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'sign-in'}
            className={`flex-1 rounded px-3 py-2 text-sm ${
              mode === 'sign-in' ? 'bg-background text-foreground' : 'text-muted-foreground'
            }`}
            onClick={() => setMode('sign-in')}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'sign-up'}
            className={`flex-1 rounded px-3 py-2 text-sm ${
              mode === 'sign-up' ? 'bg-background text-foreground' : 'text-muted-foreground'
            }`}
            onClick={() => setMode('sign-up')}
          >
            Create account
          </button>
        </div>
        <p className="mt-4 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back home
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export function LoginPageContent() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
