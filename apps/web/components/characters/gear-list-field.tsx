'use client';

import { Button, Input } from '@codex/ui';
import { useState } from 'react';

interface GearListFieldProps {
  id: string;
  items: string[];
  placeholder?: string;
  onChange: (items: string[]) => void;
}

export function GearListField({ id, items, placeholder, onChange }: GearListFieldProps) {
  const [draft, setDraft] = useState('');

  const addItem = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraft('');
  };

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {items.length === 0 && (
          <li className="text-sm text-muted-foreground italic">No gear yet — add your first item.</li>
        )}
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[index] = e.target.value;
                onChange(next);
              }}
              aria-label={`Gear item ${index + 1}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 text-destructive hover:text-destructive"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              aria-label={`Remove ${item}`}
            >
              −
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder ?? 'Add an item…'}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
        />
        <Button type="button" variant="secondary" size="sm" className="shrink-0" onClick={addItem}>
          +
        </Button>
      </div>
    </div>
  );
}
