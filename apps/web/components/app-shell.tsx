import { cn } from '@codex/ui';
import type { ReactNode } from 'react';

export type AppShellWidth = 'lobby' | 'narrow' | 'default' | 'wide' | 'full';

const WIDTH_CLASS: Record<AppShellWidth, string> = {
  lobby: 'max-w-lg',
  narrow: 'max-w-3xl',
  default: 'max-w-4xl',
  wide: 'max-w-5xl',
  full: 'max-w-6xl',
};

interface AppShellProps {
  children: ReactNode;
  width?: AppShellWidth;
  className?: string;
  /** Optional data-testid on the main landmark */
  testId?: string;
}

/** Shared under-header page chrome for app routes (accounts for fixed header + beta banner). */
export function AppShell({ children, width = 'default', className, testId }: AppShellProps) {
  return (
    <main
      id="main-content"
      className={cn(
        'mx-auto min-h-dvh w-full px-4 pt-28 pb-16 sm:px-6',
        WIDTH_CLASS[width],
        className,
      )}
      data-testid={testId}
    >
      {children}
    </main>
  );
}
