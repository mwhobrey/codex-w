'use client';

import {
  applyBurnMomentum,
  resolveActionRoll,
  resolveProgressRoll,
  type ActionRollResult,
  type IronswornChallengeRank,
} from '@codex/game-engine';
import {
  burnMomentumOnSheet,
  createVow,
  getGameSystem,
  getIronswornAsset,
  getMeterValue,
  getStatValue,
  IRONSWORN_PROGRESS_BOXES,
  IRONSWORN_RANKS,
  IRONSWORN_STATS,
  lookupOracleD100,
  lookupOracleRange,
  markVowProgress,
  parseAssetIds,
  patchMeter,
  readActiveVowId,
  readVowsFromGameState,
  rollOracleD100,
  setSheetFieldValue,
  vowsFilledBoxes,
  vowsProgressScore,
  type IronswornStatKey,
  type IronswornVow,
} from '@codex/game-systems';
import { Button, Card, CardDescription, CardHeader, CardTitle } from '@codex/ui';
import { useCallback, useMemo, useState } from 'react';
import { OracleTwistSection } from './oracle-twist-section';
import { RulesPrimerSection } from './rules-primer-section';
import { SceneFocusSection } from './scene-focus-section';
import { patchGameState, type TablePanelProps } from './table-panel-types';
import { TableSection } from './table-section';

type LastAction = ActionRollResult & { moveName: string; burned?: boolean };

export function TableIronswornPanel({
  gameSystemId,
  meta,
  onUpdateMeta,
  onAppendLog,
  activeCharacter,
  logAuthor = 'You',
  onPatchCharacter,
}: TablePanelProps) {
  const plugin = getGameSystem(gameSystemId);
  const engine = plugin.soloEngine;
  const config = engine?.ironsworn;

  const [stat, setStat] = useState<IronswornStatKey>('iron');
  const [adds, setAdds] = useState(0);
  const [selectedMoveId, setSelectedMoveId] = useState('face-danger');
  const [rollReveal, setRollReveal] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<LastAction | null>(null);
  const [rolling, setRolling] = useState(false);
  const [vowName, setVowName] = useState('');
  const [vowRank, setVowRank] = useState<IronswornChallengeRank>('dangerous');
  const [assetPick, setAssetPick] = useState(config?.assets[0]?.id ?? '');

  const vows = useMemo(
    () => readVowsFromGameState(meta.gameState as Record<string, unknown> | undefined),
    [meta.gameState],
  );
  const activeVowId = readActiveVowId(meta.gameState as Record<string, unknown> | undefined);
  const activeVow = vows.find((v) => v.id === activeVowId) ?? vows[0] ?? null;

  const momentum = getMeterValue(activeCharacter ?? null, 'momentum');
  const health = getMeterValue(activeCharacter ?? null, 'health');
  const spirit = getMeterValue(activeCharacter ?? null, 'spirit');
  const supply = getMeterValue(activeCharacter ?? null, 'supply');
  const statValue = getStatValue(activeCharacter ?? null, stat);
  const ownedAssetIds = parseAssetIds(
    activeCharacter?.fields.find((f) => f.key === 'asset_ids')?.value
      ? String(activeCharacter.fields.find((f) => f.key === 'asset_ids')?.value)
      : '',
  );

  const saveVows = useCallback(
    (next: IronswornVow[], nextActiveId: string | null) => {
      onUpdateMeta({
        gameState: patchGameState(meta, {
          vows: next,
          activeVowId: nextActiveId,
        }),
      });
    },
    [meta, onUpdateMeta],
  );

  const selectedMove = config?.moves.find((m) => m.id === selectedMoveId);

  const handleActionRoll = useCallback(() => {
    setRolling(true);
    setRollReveal(null);
    window.setTimeout(() => {
      const result = resolveActionRoll({
        stat: statValue,
        adds,
        momentum,
      });
      const moveLabel = selectedMove?.name ?? 'Action';
      let text = `${moveLabel} +${stat} (${statValue})${adds ? ` +${adds}` : ''}: action ${result.actionDie}${
        result.actionDieCancelled ? ' (cancelled)' : ''
      } → score ${result.actionScore} vs [${result.challengeDice.join(', ')}] → ${result.outcome.toUpperCase()}${
        result.match ? ' · MATCH' : ''
      }`;
      if (selectedMove) {
        const outcomeText =
          result.outcome === 'strong'
            ? selectedMove.strong
            : result.outcome === 'weak'
              ? selectedMove.weak
              : selectedMove.miss;
        text += ` — ${outcomeText}`;
      }
      setLastAction({ ...result, moveName: moveLabel });
      setRollReveal(text);
      onAppendLog({ type: 'risk', content: text, author: logAuthor });
      setRolling(false);
    }, 420);
  }, [adds, logAuthor, momentum, onAppendLog, selectedMove, stat, statValue]);

  const handleBurnMomentum = useCallback(() => {
    if (!lastAction || lastAction.burned || momentum <= 0 || !onPatchCharacter || !activeCharacter) {
      return;
    }
    const burned = applyBurnMomentum(lastAction, momentum);
    const text = `Burn momentum (${momentum}): ${lastAction.outcome.toUpperCase()} → ${burned.outcome.toUpperCase()}`;
    setLastAction({ ...burned, moveName: lastAction.moveName, burned: true });
    setRollReveal(text);
    onAppendLog({ type: 'risk', content: text, author: logAuthor });
    void onPatchCharacter((sheet) => burnMomentumOnSheet(sheet));
  }, [activeCharacter, lastAction, logAuthor, momentum, onAppendLog, onPatchCharacter]);

  const handleMeter = useCallback(
    (key: 'momentum' | 'health' | 'spirit' | 'supply', delta: number) => {
      if (!onPatchCharacter || !activeCharacter) return;
      void onPatchCharacter((sheet) => {
        const current = getMeterValue(sheet, key);
        return patchMeter(sheet, key, current + delta);
      });
    },
    [activeCharacter, onPatchCharacter],
  );

  const handleCreateVow = useCallback(() => {
    const fromSheet = activeCharacter?.fields.find((f) => f.key === 'iron_vow')?.value;
    const name =
      vowName.trim() ||
      (typeof fromSheet === 'string' && fromSheet.trim() ? fromSheet : 'Iron vow');
    const vow = createVow(name, vowRank);
    const next = [...vows, vow];
    saveVows(next, vow.id);
    setVowName('');
    onAppendLog({
      type: 'note',
      content: `Swore an iron vow (${vow.rank}): ${vow.name}`,
      author: logAuthor,
    });
  }, [activeCharacter, logAuthor, onAppendLog, saveVows, vowName, vowRank, vows]);

  const handleMarkProgress = useCallback(() => {
    if (!activeVow) return;
    const marked = markVowProgress(activeVow, 1);
    const next = vows.map((v) => (v.id === marked.id ? marked : v));
    saveVows(next, marked.id);
    const text = `Marked progress on “${marked.name}” (${vowsFilledBoxes(marked)}/${IRONSWORN_PROGRESS_BOXES} boxes)`;
    setRollReveal(text);
    onAppendLog({ type: 'note', content: text, author: logAuthor });
  }, [activeVow, logAuthor, onAppendLog, saveVows, vows]);

  const handleProgressRoll = useCallback(() => {
    if (!activeVow) return;
    setRolling(true);
    window.setTimeout(() => {
      const score = vowsProgressScore(activeVow);
      const result = resolveProgressRoll(score);
      const text = `Fulfill “${activeVow.name}” progress ${score} vs [${result.challengeDice.join(', ')}] → ${result.outcome.toUpperCase()}${
        result.match ? ' · MATCH' : ''
      }`;
      setRollReveal(text);
      onAppendLog({ type: 'risk', content: text, author: logAuthor });
      setRolling(false);
    }, 420);
  }, [activeVow, logAuthor, onAppendLog]);

  const handleOracle = useCallback(
    (oracleId: string) => {
      if (!config) return;
      const oracle = config.oracles.find((o) => o.id === oracleId);
      if (!oracle) return;
      const die = rollOracleD100();
      let text: string;
      if (oracle.kind === 'd100') {
        const entry = lookupOracleD100(
          oracle.rows as { roll: number; text: string }[],
          die,
        );
        text = `${oracle.title} (${die}): ${entry}`;
      } else {
        const entry = lookupOracleRange(
          oracle.rows as { min: number; max: number; text: string }[],
          die,
        );
        text = `${oracle.title} (${die}): ${entry}`;
      }
      if (oracleId === 'action') {
        const theme = config.oracles.find((o) => o.id === 'theme');
        if (theme?.kind === 'd100') {
          const themeDie = rollOracleD100();
          const themeText = lookupOracleD100(
            theme.rows as { roll: number; text: string }[],
            themeDie,
          );
          text = `Action/Theme (${die}/${themeDie}): ${lookupOracleD100(
            oracle.rows as { roll: number; text: string }[],
            die,
          )} / ${themeText}`;
        }
      }
      setRollReveal(text);
      onAppendLog({ type: 'oracle', content: text, author: logAuthor });
    },
    [config, logAuthor, onAppendLog],
  );

  const handleAddAsset = useCallback(() => {
    if (!assetPick || !onPatchCharacter || !activeCharacter) return;
    if (ownedAssetIds.includes(assetPick)) return;
    const next = [...ownedAssetIds, assetPick].join(', ');
    void onPatchCharacter((sheet) => setSheetFieldValue(sheet, 'asset_ids', next));
    const asset = getIronswornAsset(assetPick);
    onAppendLog({
      type: 'note',
      content: `Gained asset: ${asset?.name ?? assetPick}`,
      author: logAuthor,
    });
  }, [activeCharacter, assetPick, logAuthor, onAppendLog, onPatchCharacter, ownedAssetIds]);

  if (!engine || engine.kind !== 'ironsworn' || !config) return null;

  const vowText =
    activeCharacter?.fields.find((f) => f.key === 'iron_vow')?.value != null
      ? String(activeCharacter.fields.find((f) => f.key === 'iron_vow')?.value)
      : '';

  return (
    <Card className="overflow-hidden border-border/60 bg-card/80" data-testid="table-ironsworn-panel">
      <CardHeader className="border-b border-border/40 py-2.5">
        <CardTitle className="text-sm font-medium">{plugin.name} · Ironlands</CardTitle>
        <CardDescription className="text-xs">
          {vowText || 'Link a character, swear vows, and roll +stat vs challenge dice.'}
        </CardDescription>
      </CardHeader>

      <RulesPrimerSection points={plugin.rulesPrimer ?? []} />

      <SceneFocusSection
        title="Scene"
        placeholder="What beat of the quest are you in?"
        meta={meta}
        onUpdateMeta={onUpdateMeta}
        onAppendLog={onAppendLog}
        logAuthor={logAuthor}
        scenePrompts={engine.scenePrompts}
      />

      <TableSection title="Status">
        <div className="flex flex-wrap gap-3 text-xs" data-testid="ironsworn-meters">
          {(
            [
              ['Momentum', momentum, 'momentum'],
              ['Health', health, 'health'],
              ['Spirit', spirit, 'spirit'],
              ['Supply', supply, 'supply'],
            ] as const
          ).map(([label, value, key]) => (
            <div key={key} className="flex items-center gap-1">
              <span className="text-muted-foreground">{label}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 px-1"
                onClick={() => handleMeter(key, -1)}
                disabled={!onPatchCharacter}
              >
                −
              </Button>
              <span className="min-w-4 text-center font-medium">{value}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 px-1"
                onClick={() => handleMeter(key, 1)}
                disabled={!onPatchCharacter}
              >
                +
              </Button>
            </div>
          ))}
        </div>
      </TableSection>

      <TableSection title="Action roll">
        <div className="flex flex-wrap gap-1.5">
          {config.moves.slice(0, 8).map((move) => (
            <Button
              key={move.id}
              type="button"
              size="sm"
              variant={selectedMoveId === move.id ? 'default' : 'outline'}
              onClick={() => setSelectedMoveId(move.id)}
            >
              {move.name}
            </Button>
          ))}
        </div>
        {selectedMove ? (
          <p className="text-xs text-muted-foreground">{selectedMove.trigger}</p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          {IRONSWORN_STATS.map((id) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={stat === id ? 'default' : 'outline'}
              onClick={() => setStat(id)}
            >
              {id} ({getStatValue(activeCharacter ?? null, id)})
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Adds</span>
          {[0, 1, 2, 3].map((n) => (
            <Button
              key={n}
              type="button"
              size="sm"
              variant={adds === n ? 'default' : 'outline'}
              onClick={() => setAdds(n)}
            >
              +{n}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleActionRoll}
            disabled={rolling}
            data-testid="ironsworn-roll-action"
          >
            {rolling ? 'Rolling…' : 'Roll action'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleBurnMomentum}
            disabled={!lastAction || lastAction.burned || momentum <= 0 || !onPatchCharacter}
          >
            Burn momentum
          </Button>
        </div>
      </TableSection>

      <TableSection title="Vows">
        <div className="flex flex-wrap gap-1" data-testid="ironsworn-vow-track">
          {Array.from({ length: IRONSWORN_PROGRESS_BOXES }, (_, i) => (
            <span
              key={i}
              className={`h-3 w-6 rounded-sm border ${
                activeVow && i < vowsFilledBoxes(activeVow)
                  ? 'border-primary bg-primary'
                  : 'border-border bg-background/40'
              }`}
              aria-hidden
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {activeVow
            ? `${activeVow.name} · ${activeVow.rank} · score ${vowsProgressScore(activeVow)}`
            : 'No active vow — create one below.'}
        </p>
        {vows.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {vows.map((vow) => (
              <Button
                key={vow.id}
                type="button"
                size="sm"
                variant={activeVow?.id === vow.id ? 'default' : 'outline'}
                onClick={() => saveVows(vows, vow.id)}
              >
                {vow.name || 'Vow'}
              </Button>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          {IRONSWORN_RANKS.map((rank) => (
            <Button
              key={rank.id}
              type="button"
              size="sm"
              variant={vowRank === rank.id ? 'default' : 'outline'}
              onClick={() => setVowRank(rank.id)}
            >
              {rank.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            className="min-w-[12rem] flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs"
            placeholder="Vow name"
            value={vowName}
            onChange={(e) => setVowName(e.target.value)}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleCreateVow}
            data-testid="ironsworn-create-vow"
          >
            Swear vow
          </Button>
          <Button type="button" size="sm" onClick={handleMarkProgress} disabled={!activeVow}>
            Mark progress
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleProgressRoll}
            disabled={!activeVow || rolling}
          >
            Progress roll
          </Button>
        </div>
      </TableSection>

      <TableSection title="Oracles">
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" size="sm" variant="outline" onClick={() => handleOracle('action')}>
            Action + Theme
          </Button>
          {config.oracles
            .filter((o) => o.id !== 'action' && o.id !== 'theme')
            .map((oracle) => (
              <Button
                key={oracle.id}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleOracle(oracle.id)}
              >
                {oracle.title}
              </Button>
            ))}
        </div>
      </TableSection>

      <TableSection title="Assets">
        <div className="flex flex-wrap gap-2">
          <select
            className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            value={assetPick}
            onChange={(e) => setAssetPick(e.target.value)}
          >
            {config.assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.type})
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddAsset}
            disabled={!onPatchCharacter}
          >
            Add to sheet
          </Button>
        </div>
        {ownedAssetIds.length ? (
          <ul className="space-y-1 text-xs text-muted-foreground">
            {ownedAssetIds.map((id) => {
              const asset = getIronswornAsset(id);
              return (
                <li key={id}>
                  <span className="font-medium text-foreground">{asset?.name ?? id}</span>
                  {asset ? ` — ${asset.summary}` : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No assets on the active sheet yet.</p>
        )}
      </TableSection>

      <div
        className="min-h-10 border-t border-border/40 px-3 py-2 text-xs"
        aria-live="polite"
        data-testid="ironsworn-roll-reveal"
      >
        {rollReveal ?? <span className="text-muted-foreground">Rolls and oracle results appear here.</span>}
      </div>

      <OracleTwistSection
        oracleLikelihoods={engine.oracleLikelihoods}
        twistTable={engine.twistTable}
        oracleDice={engine.oracleDice}
        twistDice="1d6"
        onAppendLog={onAppendLog}
        logAuthor={logAuthor}
        activeCharacter={activeCharacter}
      />
    </Card>
  );
}
