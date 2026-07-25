'use client';

import {
  extractPortableProfile,
  getCharacterPeekSummary,
  getSheetFieldValue,
  normalizeGameSystemId,
  TYOV_SLOT_KEYS,
} from '@codex/game-systems';
import type { CharacterSheet } from '@codex/schemas';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator } from '@codex/ui';
import Link from 'next/link';

interface ActiveCharacterPanelProps {
  character: CharacterSheet | null;
  highlightFieldKey?: string;
  showHeaderEditLink?: boolean;
}

function fieldHighlightClass(fieldKey: string, highlightFieldKey?: string) {
  return highlightFieldKey === fieldKey
    ? 'rounded-md ring-2 ring-primary/70 ring-offset-2 ring-offset-card'
    : '';
}

export function ActiveCharacterPanel({
  character,
  highlightFieldKey,
  showHeaderEditLink = true,
}: ActiveCharacterPanelProps) {
  if (!character) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
            Active character
          </CardTitle>
          <CardDescription>Select a character to track them through this session.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const profile = extractPortableProfile(character);
  const peek = getCharacterPeekSummary(character);
  const systemId = normalizeGameSystemId(character.gameSystemId);
  const isCrossPlay =
    character.lineageSheetId !== undefined ||
    (character.originSystemId !== undefined &&
      character.originSystemId !== character.gameSystemId);

  const headlineFieldKey =
    systemId === 'snallygaster'
      ? getSheetFieldValue(character, 'motivation')
        ? 'motivation'
        : 'camp_name'
      : systemId === 'loner' || systemId === 'paranormal-files'
        ? 'concept'
        : systemId === 'totv'
          ? 'vampire_name'
          : systemId === 'ironsworn'
            ? 'iron_vow'
            : systemId === 'muscadines'
              ? 'style'
              : 'goal';

  const summaryFieldKey =
    systemId === 'totv'
      ? 'diary'
      : systemId === 'snallygaster'
        ? 'style'
        : systemId === 'ironsworn'
          ? 'background'
          : 'motive';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="font-display text-lg">{character.name}</CardTitle>
            <CardDescription className="mt-1 flex flex-wrap gap-1.5">
              <Badge variant="secondary">{character.gameSystemId}</Badge>
              {isCrossPlay && character.originSystemId && (
                <Badge variant="outline">from {character.originSystemId}</Badge>
              )}
            </CardDescription>
          </div>
          {showHeaderEditLink ? (
            <Link
              href={`/characters/${character.id}`}
              className="text-xs text-primary hover:underline"
            >
              Edit
            </Link>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {peek.headline ? (
          <div className={fieldHighlightClass(headlineFieldKey, highlightFieldKey)}>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {peek.headlineLabel}
            </p>
            <p className="text-foreground">{peek.headline}</p>
          </div>
        ) : null}
        {peek.details.map((row) => (
          <div key={row.fieldKey} className={fieldHighlightClass(row.fieldKey, highlightFieldKey)}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {row.label}
            </p>
            <p className="text-foreground">
              {row.fieldKey === 'luck' ? `${row.value}/6` : row.value}
            </p>
          </div>
        ))}
        {peek.summary ? (
          <div className={fieldHighlightClass(summaryFieldKey, highlightFieldKey)}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {systemId === 'totv'
                ? 'Diary'
                : systemId === 'snallygaster'
                  ? 'Style'
                  : systemId === 'ironsworn'
                    ? 'Background'
                    : 'Motive'}
            </p>
            <p className="line-clamp-4 text-muted-foreground">{peek.summary}</p>
          </div>
        ) : null}
        {systemId === 'ironsworn' ? (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              Momentum {getSheetFieldValue(character, 'momentum') || '2'} · Health{' '}
              {getSheetFieldValue(character, 'health') || '5'} · Spirit{' '}
              {getSheetFieldValue(character, 'spirit') || '5'} · Supply{' '}
              {getSheetFieldValue(character, 'supply') || '5'}
            </p>
          </div>
        ) : null}
        {systemId === 'totv' ? (
          <>
            <Separator />
            <div className="space-y-2">
              {(() => {
                const markFilled = (['mark_1', 'mark_2', 'mark_3', 'mark_4', 'mark_5'] as const).filter(
                  (key) => getSheetFieldValue(character, key),
                ).length;
                return markFilled > 0 ? (
                  <p className="text-xs text-muted-foreground">Marks {markFilled}/5</p>
                ) : null;
              })()}
              {(Object.keys(TYOV_SLOT_KEYS) as Array<keyof typeof TYOV_SLOT_KEYS>).flatMap((kind) =>
                TYOV_SLOT_KEYS[kind].map((key) => {
                  const value = getSheetFieldValue(character, key);
                  if (!value && highlightFieldKey !== key) return null;
                  return (
                    <div key={key} className={fieldHighlightClass(key, highlightFieldKey)}>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {key.replace('_', ' ')}
                      </p>
                      <p className="line-clamp-3 text-muted-foreground">{value || '—'}</p>
                    </div>
                  );
                }),
              )}
            </div>
          </>
        ) : null}
        {profile.traits.length > 0 && (
          <>
            <Separator />
            <ul className="space-y-1 text-xs text-muted-foreground">
              {profile.traits.map((trait) => (
                <li key={trait}>{trait}</li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
