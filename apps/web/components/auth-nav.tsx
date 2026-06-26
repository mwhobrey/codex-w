'use client';

import { useSession } from '@/lib/auth-client';
import { signOutWithLocalCleanup } from '@/lib/auth-sign-out';
import { userDisplayName } from '@/lib/user-display-name';
import { Button, cn } from '@codex/ui';
import Link from 'next/link';

interface AuthNavProps {
  variant?: 'inline' | 'mobile';
}

export function AuthNav({ variant = 'inline' }: AuthNavProps) {
  const { data: session, isPending } = useSession();
  const isMobile = variant === 'mobile';

  if (isPending) {
    return (
      <span
        className={cn(
          'inline-block h-8',
          isMobile ? 'w-full' : 'hidden w-24 sm:inline-block',
        )}
        aria-hidden
      />
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className={cn(
          'rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary',
          isMobile ? 'block w-full py-2.5 text-center' : 'hidden sm:block',
        )}
      >
        Sign in
      </Link>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2">
        <span
          className="truncate px-3 text-sm text-muted-foreground"
          title={session.user.email}
        >
          {userDisplayName(session.user)}
        </span>
        <Button
          type="button"
          variant="outline"
          className="w-full border-border text-muted-foreground hover:text-primary"
          onClick={() => void signOutWithLocalCleanup()}
        >
          Sign out
        </Button>
      </div>
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
