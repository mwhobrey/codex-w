/** Presence label: `PlayerName/CharacterName` when a character is linked. */
export function formatPlayerTag(playerName: string, characterName?: string | null): string {
  const player = playerName.trim();
  const character = characterName?.trim();
  if (!player) return character ?? '';
  if (!character) return player;
  return `${player}/${character}`;
}
