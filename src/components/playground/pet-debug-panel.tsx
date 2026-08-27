import {
  formatPetDebugTooltip,
  type PetDebugTooltipParts,
} from '@/utils/pets/format-pet-debug-tooltip';
import { useEffect, useState, type RefObject } from 'react';
import { PlaygroundFloatingPanel } from './playground-floating-panel';
import type { PlaygroundPetStageHandle } from './playground-pet-stage';
import type { PanelPosition } from './use-panel-drag';

type PetDebugPanelProps = {
  petRef: RefObject<PlaygroundPetStageHandle | null>;
  boundsRef: RefObject<HTMLElement | null>;
  position: PanelPosition | null;
  onPositionChange: (position: PanelPosition) => void;
  onClose: () => void;
};

/**
 * Admin-only playground chrome panel with live clip / size / center stats.
 */
export function PetDebugPanel({
  petRef,
  boundsRef,
  position,
  onPositionChange,
  onClose,
}: PetDebugPanelProps) {
  const [label, setLabel] = useState(() =>
    formatPetDebugTooltip({
      actionKey: '—',
      mediaUrl: '',
      currentTime: 0,
      duration: 0,
      renderWidth: 0,
      renderHeight: 0,
      centerX: 0,
      centerY: 0,
    })
  );
  const [snapshot, setSnapshot] = useState<PetDebugTooltipParts | null>(null);

  useEffect(() => {
    let frameId = 0;
    const tick = () => {
      const next = petRef.current?.getDebugSnapshot?.() ?? null;
      setSnapshot(next);
      if (next) {
        setLabel(formatPetDebugTooltip(next));
      }
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [petRef]);

  return (
    <PlaygroundFloatingPanel
      title="Debug"
      anchor="mid-right"
      boundsRef={boundsRef}
      position={position}
      onPositionChange={onPositionChange}
      onClose={onClose}
      className="w-72"
    >
      <div
        className="space-y-2 font-mono text-[11px] leading-relaxed text-[color:var(--picker-fg)]"
        data-testid="pet-debug-panel"
      >
        <p className="m-0 break-all rounded-md bg-[color:var(--picker-selected)] px-2 py-1.5">
          {label}
        </p>
        {snapshot ? (
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className="opacity-60">clip</dt>
            <dd className="m-0 break-all">{snapshot.actionKey}</dd>
            <dt className="opacity-60">mount</dt>
            <dd className="m-0 break-all">{snapshot.mountId ?? '—'}</dd>
            <dt className="opacity-60">ready</dt>
            <dd className="m-0">{snapshot.startupReady ? 'yes' : 'no'}</dd>
            <dt className="opacity-60">cdn</dt>
            <dd className="m-0">
              {snapshot.mediaUrl ? (
                <a
                  href={snapshot.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--picker-accent)] underline underline-offset-2 hover:opacity-90"
                >
                  link
                </a>
              ) : (
                <span className="opacity-60">—</span>
              )}
            </dd>
            <dt className="opacity-60">time</dt>
            <dd className="m-0">
              {snapshot.currentTime.toFixed(2)} / {snapshot.duration.toFixed(2)}
            </dd>
            <dt className="opacity-60">size</dt>
            <dd className="m-0">
              {Math.round(snapshot.renderWidth)} ×{' '}
              {Math.round(snapshot.renderHeight)}
            </dd>
            <dt className="opacity-60">center</dt>
            <dd className="m-0">
              ({Math.round(snapshot.centerX)}, {Math.round(snapshot.centerY)})
            </dd>
          </dl>
        ) : (
          <p className="m-0 opacity-60">Waiting for pet…</p>
        )}
      </div>
    </PlaygroundFloatingPanel>
  );
}
