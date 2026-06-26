'use client';

import { extractPortableProfile, getSheetFieldValue, TYOV_SLOT_KEYS } from '@codex/game-systems';
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
  const isCrossPlay =
    character.lineageSheetId !== undefined ||
    (character.originSystemId !== undefined &&
      character.originSystemId !== character.gameSystemId);

  const lonerGoal = getSheetFieldValue(character, 'goal');
  const lonerMotive = getSheetFieldValue(character, 'motive');
  const lonerNemesis = getSheetFieldValue(character, 'nemesis');
  const humanName = getSheetFieldValue(character, 'human_name');
  const vampireName = getSheetFieldValue(character, 'vampire_name');
  const fear = getSheetFieldValue(character, 'fear');
  const jamSpecialty = getSheetFieldValue(character, 'jam_specialty');
  const grove = getSheetFieldValue(character, 'grove');

  const headline =
    character.gameSystemId === 'totv'
      ? vampireName || humanName || profile.tagline
      : character.gameSystemId === 'ironforge'
        ? getSheetFieldValue(character, 'iron_oath') || profile.tagline
        : character.gameSystemId === 'snallygaster'
        ? fear || profile.tagline
        : character.gameSystemId === 'muscadines'
          ? jamSpecialty || grove || profile.tagline
          : lonerGoal || profile.tagline;

  const headlineLabel =
    character.gameSystemId === 'totv'
      ? 'Identity'
      : character.gameSystemId === 'ironforge'
        ? 'Oath'
        : character.gameSystemId === 'snallygaster'
        ? 'Fear'
        : character.gameSystemId === 'muscadines'
          ? 'Grove craft'
          : 'Goal';

  const summary =
    character.gameSystemId === 'totv'
      ? getSheetFieldValue(character, 'diary') || profile.summary
      : character.gameSystemId === 'ironforge'
        ? getSheetFieldValue(character, 'scars') || profile.summary
        : character.gameSystemId === 'snallygaster'
        ? getSheetFieldValue(character, 'secret') || profile.summary
        : character.gameSystemId === 'muscadines'
          ? getSheetFieldValue(character, 'cozy_dark') || profile.summary
          : lonerMotive || profile.summary;

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
        {headline && (
          <div className={fieldHighlightClass('goal', highlightFieldKey)}>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">{headlineLabel}</p>
            <p className="text-foreground">{headline}</p>
          </div>
        )}
        {summary && (
          <div
            className={fieldHighlightClass(
              character.gameSystemId === 'totv' ? 'diary' : 'motive',
              highlightFieldKey,
            )}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {character.gameSystemId === 'totv' ? 'Diary' : 'Motive'}
            </p>
            <p className="line-clamp-4 text-muted-foreground">{summary}</p>
          </div>
        )}
        {(lonerNemesis || profile.nemesis) &&
          (character.gameSystemId === 'loner' || character.gameSystemId === 'ironforge') && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {character.gameSystemId === 'ironforge' ? 'Opposition' : 'Nemesis'}
            </p>
            <p className="text-muted-foreground">
              {character.gameSystemId === 'ironforge'
                ? getSheetFieldValue(character, 'iron_nemesis') || profile.nemesis
                : lonerNemesis || profile.nemesis}
            </p>
          </div>
        )}
        {character.gameSystemId === 'totv' ? (
          <>
            <Separator />
            <div className="space-y-2">
              {(Object.keys(TYOV_SLOT_KEYS) as Array<keyof typeof TYOV_SLOT_KEYS>).flatMap((kind) =>
                TYOV_SLOT_KEYS[kind].map((key) => {
                  const value = getSheetFieldValue(character, key);
                  if (!value && highlightFieldKey !== key) return null;
                  return (
                    <div key={key} className={fieldHighlightClass(key, highlightFieldKey)}>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {key.replace('_', ' ')}
                      </p>
                      <p className="text-muted-foreground">{value || '—'}</p>
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
