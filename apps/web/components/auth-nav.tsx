'use client';

import { signOut, useSession } from '@/lib/auth-client';
import { userDisplayName } from '@/lib/user-display-name';
import { Button } from '@codex/ui';
import Link from 'next/link';

export function AuthNav() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <span className="hidden h-8 w-24 sm:inline" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="hidden rounded-full border border-codex-border px-4 py-2 text-sm font-medium text-codex-text-muted transition-colors hover:border-codex-ember/40 hover:text-codex-ember sm:block"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span className="max-w-[140px] truncate text-sm text-codex-text-muted" title={session.user.email}>
        {userDisplayName(session.user)}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 border-codex-border text-codex-text-muted hover:text-codex-ember"
        onClick={() => void signOut()}
      >
        Sign out
      </Button>
    </div>
  );
}
