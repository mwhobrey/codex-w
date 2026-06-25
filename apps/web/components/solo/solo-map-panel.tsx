'use client';

import { VttCanvas } from '@/components/play/vtt-canvas';
import { useSoloMap } from '@/hooks/use-solo-map';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@codex/ui';

interface SoloMapPanelProps {
  sessionId: string;
}

export function SoloMapPanel({ sessionId }: SoloMapPanelProps) {
  const { doc, ready } = useSoloMap(sessionId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
          Scene map
        </CardTitle>
        <CardDescription>
          Same sketch surface as play rooms — saved locally per solo session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-[280px] overflow-hidden rounded-lg border border-border bg-codex-void/40 sm:h-[360px]">
          {!ready || !doc ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading map…
            </div>
          ) : (
            <VttCanvas doc={doc} showToolbar={false} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
