'use client';

import type { LibraryEntry } from '@codex/game-systems';
import type { LibraryTableRow, UserLibraryTable } from '@codex/schemas';
import { Badge, Button, Input, Label, Textarea } from '@codex/ui';
import { useEffect, useMemo, useState } from 'react';
import { shouldBlankProseOnClone } from '@/lib/clone-library-table';

type LibrarySource = 'reference' | 'mine';

interface LibraryBrowserProps {
  referenceEntries: LibraryEntry[];
  userTables?: UserLibraryTable[];
  userTablesReady?: boolean;
  onCloneReference?: (entry: LibraryEntry) => Promise<string>;
  onCreateEmpty?: () => Promise<string>;
  onSaveUserTable?: (table: UserLibraryTable) => void | Promise<void>;
  onDeleteUserTable?: (id: string) => void | Promise<void>;
}

function systemFilterLabel(entries: { systemId?: string; systemName?: string }[], systemId: string): string {
  const match = entries.find((entry) => entry.systemId === systemId);
  return match?.systemName ?? systemId;
}

function ReferenceDetail({
  entry,
  onClone,
}: {
  entry: LibraryEntry;
  onClone?: (entry: LibraryEntry) => Promise<string>;
}) {
  const [cloning, setCloning] = useState(false);

  return (
    <section
      className="min-h-[12rem] rounded-xl border border-border/60 bg-card/60 p-4 lg:max-h-[min(70vh,36rem)] lg:overflow-y-auto"
      aria-live="polite"
    >
      <header className="mb-4 flex flex-wrap items-center gap-2 border-b border-border/40 pb-3">
        <h2 className="font-display text-lg font-medium text-foreground">{entry.title}</h2>
        <Badge variant="secondary">{entry.systemName}</Badge>
        <Badge variant="outline" className="text-[10px] uppercase">
          Reference
        </Badge>
        {onClone ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="ml-auto"
            disabled={cloning}
            data-testid="library-clone-reference"
            onClick={() => {
              setCloning(true);
              void onClone(entry).finally(() => setCloning(false));
            }}
          >
            {cloning ? 'Saving…' : 'Save to my library'}
          </Button>
        ) : null}
      </header>
      {shouldBlankProseOnClone(entry.category) ? (
        <p className="mb-3 text-xs text-muted-foreground">
          Saving copies the row structure — fill in text from your own book.
        </p>
      ) : null}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40 text-left text-[10px] uppercase tracking-wide text-muted-foreground">
            <th className="w-16 py-2 pr-3 font-medium">Roll</th>
            <th className="w-32 py-2 pr-3 font-medium">Label</th>
            <th className="py-2 font-medium">Result</th>
          </tr>
        </thead>
        <tbody>
          {entry.rows.map((row, index) => (
            <tr key={`${entry.id}-${index}`} className="border-b border-border/20 align-top last:border-0">
              <td className="py-2 pr-3 font-mono text-primary">{row.roll ?? '—'}</td>
              <td className="py-2 pr-3 font-medium text-foreground">{row.label ?? '—'}</td>
              <td className="py-2 text-muted-foreground">{row.text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function UserTableEditor({
  table,
  onSave,
  onDelete,
}: {
  table: UserLibraryTable;
  onSave?: (table: UserLibraryTable) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState(table);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(table);
  }, [table]);

  const persist = async (next: UserLibraryTable) => {
    setSaving(true);
    setDraft(next);
    await onSave?.(next);
    setSaving(false);
  };

  const updateRow = (index: number, patch: Partial<LibraryTableRow>) => {
    const rows = [...draft.rows];
    rows[index] = { ...rows[index]!, ...patch };
    setDraft({ ...draft, rows });
  };

  return (
    <section
      className="min-h-[12rem] rounded-xl border border-border/60 bg-card/60 p-4 lg:max-h-[min(70vh,36rem)] lg:overflow-y-auto"
      data-testid="user-library-table-editor"
    >
      <header className="mb-4 space-y-3 border-b border-border/40 pb-3">
        <div className="flex flex-wrap items-start gap-2">
          <div className="min-w-0 flex-1">
            <Label htmlFor={`library-table-name-${table.id}`} className="sr-only">
              Table name
            </Label>
            <Input
              id={`library-table-name-${table.id}`}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              onBlur={() => void persist(draft)}
              className="font-display text-lg"
            />
          </div>
          <Badge variant="outline" className="text-[10px] uppercase">
            My table
          </Badge>
          {onDelete ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-destructive"
              onClick={() => {
                if (window.confirm(`Delete "${draft.name}"?`)) void onDelete(table.id);
              }}
            >
              Delete
            </Button>
          ) : null}
        </div>
        {saving ? <p className="text-xs text-muted-foreground">Saving…</p> : null}
      </header>

      <div className="space-y-3">
        {draft.rows.map((row, index) => (
          <div key={`${table.id}-row-${index}`} className="grid gap-2 rounded-lg border border-border/50 p-3 sm:grid-cols-[4rem_8rem_1fr_auto]">
            <Input
              value={row.roll ?? ''}
              onChange={(e) => {
                const value = e.target.value.trim();
                updateRow(index, { roll: value ? Number(value) : undefined });
              }}
              onBlur={() => void persist(draft)}
              placeholder="Roll"
              className="font-mono text-sm"
              aria-label={`Row ${index + 1} roll`}
            />
            <Input
              value={row.label ?? ''}
              onChange={(e) => updateRow(index, { label: e.target.value || undefined })}
              onBlur={() => void persist(draft)}
              placeholder="Label"
              aria-label={`Row ${index + 1} label`}
            />
            <Textarea
              value={row.text}
              onChange={(e) => updateRow(index, { text: e.target.value })}
              onBlur={() => void persist(draft)}
              rows={2}
              aria-label={`Row ${index + 1} result`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={draft.rows.length <= 1}
              onClick={() => {
                const rows = draft.rows.filter((_, rowIndex) => rowIndex !== index);
                void persist({ ...draft, rows });
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            void persist({
              ...draft,
              rows: [...draft.rows, { text: 'New result' }],
            });
          }}
        >
          Add row
        </Button>
        <Button type="button" size="sm" onClick={() => void persist(draft)}>
          Save table
        </Button>
      </div>
    </section>
  );
}

export function LibraryBrowser({
  referenceEntries,
  userTables = [],
  userTablesReady = true,
  onCloneReference,
  onCreateEmpty,
  onSaveUserTable,
  onDeleteUserTable,
}: LibraryBrowserProps) {
  const [source, setSource] = useState<LibrarySource>('reference');
  const [filter, setFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(`ref:${referenceEntries[0]?.id ?? ''}`);

  const filterPool = useMemo(() => {
    if (source === 'reference') return referenceEntries;
    return userTables.map((table) => ({
      id: table.id,
      systemId: table.systemId,
      systemName: table.systemId ?? 'Custom',
      title: table.name,
      category: table.category,
      rows: table.rows,
    }));
  }, [referenceEntries, source, userTables]);

  const systems = useMemo(
    () => [...new Set(filterPool.map((entry) => entry.systemId).filter(Boolean))] as string[],
    [filterPool],
  );

  const visible = useMemo(() => {
    let list = filterPool;
    if (filter !== 'all') {
      list = list.filter((entry) => entry.systemId === filter);
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.systemName.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q) ||
        entry.rows.some(
          (row) =>
            row.text.toLowerCase().includes(q) ||
            (row.label?.toLowerCase().includes(q) ?? false),
        ),
    );
  }, [filterPool, filter, query]);

  useEffect(() => {
    if (!visible.length) {
      setSelectedKey(null);
      return;
    }
    const prefix = source === 'reference' ? 'ref:' : 'user:';
    const currentId = selectedKey?.startsWith(prefix) ? selectedKey.slice(prefix.length) : null;
    if (!currentId || !visible.some((entry) => entry.id === currentId)) {
      setSelectedKey(`${prefix}${visible[0]!.id}`);
    }
  }, [source, visible, selectedKey]);

  const selectedReference =
    source === 'reference' && selectedKey?.startsWith('ref:')
      ? referenceEntries.find((entry) => entry.id === selectedKey.slice(4))
      : null;

  const selectedUser =
    source === 'mine' && selectedKey?.startsWith('user:')
      ? userTables.find((table) => table.id === selectedKey.slice(5))
      : null;

  const handleClone = async (entry: LibraryEntry): Promise<string> => {
    if (!onCloneReference) return '';
    const id = await onCloneReference(entry);
    setSource('mine');
    setSelectedKey(`user:${id}`);
    return id;
  };

  return (
    <div data-testid="library-browser" className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border border-border/50 p-0.5" role="group" aria-label="Library source">
          <button
            type="button"
            onClick={() => {
              setSource('reference');
              setFilter('all');
            }}
            aria-pressed={source === 'reference'}
            className={`rounded px-3 py-1.5 text-xs min-h-9 ${
              source === 'reference' ? 'bg-background text-foreground' : 'text-muted-foreground'
            }`}
          >
            Reference
          </button>
          <button
            type="button"
            onClick={() => {
              setSource('mine');
              setFilter('all');
            }}
            aria-pressed={source === 'mine'}
            className={`rounded px-3 py-1.5 text-xs min-h-9 ${
              source === 'mine' ? 'bg-background text-foreground' : 'text-muted-foreground'
            }`}
            data-testid="library-my-tables-tab"
          >
            My tables
          </button>
        </div>
        {source === 'mine' && onCreateEmpty ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            data-testid="library-new-table"
            onClick={() => {
              void onCreateEmpty().then((id) => setSelectedKey(`user:${id}`));
            }}
          >
            New table
          </Button>
        ) : null}
      </div>

      <div>
        <Label htmlFor="library-search" className="sr-only">
          Search library
        </Label>
        <Input
          id="library-search"
          type="search"
          placeholder="Search tables, prompts, oracles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {systems.length > 0 ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by system">
          <button
            type="button"
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
            className={`rounded-full border px-3 py-1 text-xs ${
              filter === 'all' ? 'border-primary text-primary' : 'border-border text-muted-foreground'
            }`}
          >
            All systems
          </button>
          {systems.map((systemId) => (
            <button
              key={systemId}
              type="button"
              onClick={() => setFilter(systemId)}
              aria-pressed={filter === systemId}
              className={`rounded-full border px-3 py-1 text-xs ${
                filter === systemId
                  ? 'border-primary text-primary'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {systemFilterLabel(filterPool, systemId)}
            </button>
          ))}
        </div>
      ) : null}

      {source === 'mine' && !userTablesReady ? (
        <p className="text-sm text-muted-foreground">Loading your tables…</p>
      ) : null}

      {source === 'mine' && userTablesReady && userTables.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No custom tables yet. Clone a reference table or create a blank one.
        </p>
      ) : null}

      {visible.length === 0 && (source === 'reference' || userTables.length > 0) ? (
        <p className="text-sm text-muted-foreground">No entries match your search.</p>
      ) : visible.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-[minmax(12rem,16rem)_1fr] md:gap-6">
          <nav
            className="flex max-h-[min(50vh,24rem)] flex-col gap-2 overflow-y-auto md:max-h-[min(70vh,36rem)]"
            aria-label="Library tables"
          >
            {visible.map((entry) => {
              const prefix = source === 'reference' ? 'ref:' : 'user:';
              const key = `${prefix}${entry.id}`;
              const active = selectedKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  aria-current={active ? 'true' : undefined}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? 'border-primary/50 bg-primary/10 text-foreground'
                      : 'border-border/60 bg-card/50 text-muted-foreground hover:border-border hover:bg-secondary/40 hover:text-foreground'
                  }`}
                >
                  <span className="block truncate font-medium">{entry.title}</span>
                  <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-muted-foreground/80">
                    {entry.systemName}
                  </span>
                </button>
              );
            })}
          </nav>

          {selectedReference ? (
            <ReferenceDetail entry={selectedReference} onClone={handleClone} />
          ) : null}
          {selectedUser ? (
            <UserTableEditor table={selectedUser} onSave={onSaveUserTable} onDelete={onDeleteUserTable} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
