export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/50 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          <span className="font-display text-foreground">Codex-W</span>
          {' · '}
          Local-first TTRPG toolkit
        </p>
        <p className="text-xs text-muted-foreground/70">
          Local-first TTRPG toolkit · Solo and multiplayer tables
        </p>
      </div>
    </footer>
  );
}
