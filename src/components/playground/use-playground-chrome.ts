import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PanelPosition } from './use-panel-drag';
import {
  readPlaygroundLayout,
  writePlaygroundChrome,
} from './playground-layout-storage';

export type ChromeId =
  | 'pets'
  | 'actions'
  | 'widgets'
  | 'feedback'
  | 'camera'
  | 'debug';

export const CHROME_PANEL_META: readonly {
  id: ChromeId;
  label: string;
}[] = [
  { id: 'pets', label: 'Pets' },
  { id: 'actions', label: 'Actions' },
  { id: 'widgets', label: 'Widgets' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'camera', label: 'Camera' },
  { id: 'debug', label: 'Debug' },
];

type VisibleMap = Record<ChromeId, boolean>;
type PositionMap = Partial<Record<ChromeId, PanelPosition>>;

const ALL_VISIBLE: VisibleMap = {
  pets: false,
  actions: true,
  widgets: false,
  feedback: false,
  camera: true,
  debug: true,
};

/**
 * Visibility and positions for playground chrome panels, persisted in localStorage.
 * Wallpaper is fixed top-right and not part of this chrome state.
 * The Actions panel is open by default (anchored beside the pet on the right);
 * other chrome panels stay opt-in from the dock.
 */
export function usePlaygroundChrome(options: {
  enableCamera: boolean;
  /** When false, Debug stays out of the dock and cannot open. */
  enableDebug?: boolean;
}) {
  const { enableCamera, enableDebug = false } = options;

  const [visible, setVisible] = useState<VisibleMap>(() => ({
    ...ALL_VISIBLE,
    camera: enableCamera,
    debug: enableDebug,
  }));
  const [positions, setPositions] = useState<PositionMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readPlaygroundLayout();
    if (stored?.visible) {
      setVisible({
        ...ALL_VISIBLE,
        ...stored.visible,
        camera: enableCamera ? (stored.visible.camera ?? true) : false,
        debug: enableDebug ? (stored.visible.debug ?? true) : false,
      });
    } else {
      setVisible({
        ...ALL_VISIBLE,
        camera: enableCamera,
        debug: enableDebug,
      });
    }
    if (stored?.positions) {
      setPositions(stored.positions);
    }
    setHydrated(true);
  }, [enableCamera, enableDebug]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    writePlaygroundChrome({ visible, positions });
  }, [hydrated, visible, positions]);

  const setPosition = useCallback((id: ChromeId, position: PanelPosition) => {
    setPositions((current) => {
      const prev = current[id];
      if (prev && prev.x === position.x && prev.y === position.y) {
        return current;
      }
      return { ...current, [id]: position };
    });
  }, []);

  const closePanel = useCallback((id: ChromeId) => {
    setVisible((current) =>
      current[id] ? { ...current, [id]: false } : current
    );
  }, []);

  const togglePanel = useCallback((id: ChromeId) => {
    setVisible((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  const showPanel = useCallback((id: ChromeId) => {
    setVisible((current) =>
      current[id] ? current : { ...current, [id]: true }
    );
  }, []);

  const stripPanels = useMemo(
    () =>
      CHROME_PANEL_META.filter((panel) => {
        if (panel.id === 'camera') return enableCamera;
        if (panel.id === 'debug') return enableDebug;
        return true;
      }),
    [enableCamera, enableDebug]
  );

  return {
    visible,
    positions,
    setPosition,
    closePanel,
    togglePanel,
    showPanel,
    stripPanels,
    hydrated,
  };
}
