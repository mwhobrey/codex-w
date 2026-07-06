'use client';

import { TableSection } from './table-section';

interface RulesPrimerSectionProps {
  points: string[];
}

/** Collapsed-by-default "how this works" primer for solo players without a GM to ask. */
export function RulesPrimerSection({ points }: RulesPrimerSectionProps) {
  if (points.length === 0) return null;

  return (
    <TableSection title="How this works" defaultOpen={false}>
      <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-muted-foreground">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </TableSection>
  );
}
