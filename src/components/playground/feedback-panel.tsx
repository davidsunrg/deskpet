import { FeedbackWidget } from '@/components/feedback/feedback-widget';
import type { RefObject } from 'react';
import { PlaygroundFloatingPanel } from './playground-floating-panel';
import type { PanelPosition } from './use-panel-drag';

type FeedbackPanelProps = {
  boundsRef: RefObject<HTMLElement | null>;
  position: PanelPosition | null;
  onPositionChange: (position: PanelPosition) => void;
  onClose: () => void;
};

/**
 * Standalone feedback panel for the playground dock.
 */
export function FeedbackPanel({
  boundsRef,
  position,
  onPositionChange,
  onClose,
}: FeedbackPanelProps) {
  return (
    <PlaygroundFloatingPanel
      title="Feedback"
      anchor="bottom-right"
      boundsRef={boundsRef}
      position={position}
      onPositionChange={onPositionChange}
      onClose={onClose}
      className="w-72"
    >
      <FeedbackWidget sourceLabel="Playground Feedback" />
    </PlaygroundFloatingPanel>
  );
}
