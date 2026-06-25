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
    <Card className="mx-auto w-full max-w-md border-codex-border bg-codex-surface">
      <CardHeader>
        <CardTitle className="font-display text-2xl">
          {mode === 'sign-in' ? 'Sign in' : 'Create account'}
        </CardTitle>
        <CardDescription>
          Cloud backup for characters when Neon + Better Auth are configured. Local play still works
          offline without an account.
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
          <Button type="submit" className="codex-glow w-full" disabled={loading}>
            {loading ? 'Working…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === 'sign-in' ? (
            <>
              New here?{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setMode('sign-up')}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setMode('sign-in')}
              >
                Sign in
              </button>
            </>
          )}
        </p>
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
