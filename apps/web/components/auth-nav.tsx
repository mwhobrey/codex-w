'use client';

import { useSession } from '@/lib/auth-client';
import { signOutWithLocalCleanup } from '@/lib/auth-sign-out';
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
        className="hidden rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary sm:block"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span className="max-w-[140px] truncate text-sm text-muted-foreground" title={session.user.email}>
        {userDisplayName(session.user)}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 border-border text-muted-foreground hover:text-primary"
        onClick={() => void signOutWithLocalCleanup()}
      >
        Sign out
      </Button>
    </div>
  );
}
