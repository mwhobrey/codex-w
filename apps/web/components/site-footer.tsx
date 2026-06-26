export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-codex-border/50 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <p className="text-sm text-codex-text-faint">
          <span className="font-display text-codex-text-muted">Codex-W</span>
          {' · '}
          Local-first TTRPG toolkit
        </p>
        <p className="text-xs text-codex-text-faint">
          Phase 0 scaffold · Built with Next.js, Yjs, Excalidraw
        </p>
      </div>
    </footer>
  );
}
