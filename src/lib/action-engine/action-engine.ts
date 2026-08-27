export type ActionClipRef = {
  key: string;
};

export type ActionEngineTransition<
  ClipKey extends string,
  Posture extends string,
> = {
  from: Posture;
  requires: readonly ClipKey[];
  play: readonly ClipKey[];
  to: Posture;
};

export type ActionEngineClipMeta<
  ClipKey extends string = string,
  MenuItemKey extends string = string,
  Posture extends string = string,
> = {
  posture: Posture;
  plannerPosture: Posture;
  loop: boolean;
  logicalAction: MenuItemKey | null;
  successors: readonly ClipKey[];
  /** Optional generation / QA contracts ignored by the planner. */
  firstFrameContract?: string;
  lastFrameContract?: string;
  internalMovement?: boolean;
  windowMovement?: boolean;
  scaleChange?: boolean;
};

export type ActionEngineConfig<
  ClipKey extends string = string,
  MenuItemKey extends string = string,
  Posture extends string = string,
> = {
  /** Optional schema version for future config migrations. */
  version?: number;
  defaultClip: ClipKey;
  postures: Readonly<Record<Posture, { sustainedClips: readonly ClipKey[] }>>;
  clips: Readonly<
    Record<ClipKey, ActionEngineClipMeta<ClipKey, MenuItemKey, Posture>>
  >;
  menuItems: Readonly<
    Record<
      MenuItemKey,
      {
        labelKey: string;
        label: string;
        group: string;
        transitions: readonly ActionEngineTransition<ClipKey, Posture>[];
      }
    >
  >;
  menuOrder: readonly MenuItemKey[];
  /** Logical actions whose terminal sustained clip holds after a manual pick. */
  manualHoldActions: readonly MenuItemKey[];
  autoplay: {
    preferences: Readonly<Record<Posture, readonly MenuItemKey[]>>;
    avoidImmediateRepeat: boolean;
    allowRepeat: Readonly<Partial<Record<MenuItemKey, boolean>>>;
    avoidAfter: Readonly<Partial<Record<MenuItemKey, readonly MenuItemKey[]>>>;
    dwellLoops: Readonly<Record<Posture, { min: number; max: number }>>;
  };
  contractChains?: Readonly<Record<string, readonly ClipKey[]>>;
  previewChains?: Readonly<Record<string, readonly ClipKey[]>>;
};

export type ExpandedAction<
  ClipKey extends string = string,
  MenuItemKey extends string = string,
  Posture extends string = string,
> = {
  clips: ClipKey[];
  logicalAction: MenuItemKey;
  endingPosture: Posture;
};

export type ActionMenuState<MenuItemKey extends string = string> = {
  id: MenuItemKey;
  labelKey: string;
  label: string;
  group: string;
  disabled: boolean;
};

export type ActionEngine<
  ClipKey extends string = string,
  MenuItemKey extends string = string,
  Posture extends string = string,
> = {
  config: ActionEngineConfig<ClipKey, MenuItemKey, Posture>;
  availableClipKeys(actions: readonly ActionClipRef[]): Set<ClipKey>;
  initialClipKey(actions: readonly ActionClipRef[]): ClipKey | null;
  postureFromClipKey(clipKey: string): Posture;
  plannerPostureFromClipKey(clipKey: string): Posture;
  isLoopClip(clipKey: string): boolean;
  logicalActionFromClipKey(clipKey: string): MenuItemKey | null;
  expandMenuAction(
    menuItem: MenuItemKey,
    posture: Posture,
    availableClips: ReadonlySet<string>
  ): ExpandedAction<ClipKey, MenuItemKey, Posture> | null;
  listMenuItems(
    availableClips: ReadonlySet<string>,
    posture: Posture
  ): ActionMenuState<MenuItemKey>[];
  listAutoplayMenuItems(
    availableClips: ReadonlySet<string>,
    posture: Posture
  ): MenuItemKey[];
  pickAutoplayMenuItem(
    availableClips: ReadonlySet<string>,
    posture: Posture,
    previous: MenuItemKey | null,
    random?: () => number
  ): MenuItemKey | null;
  defaultDwellLoops(clipKey: string, random?: () => number): number;
  shouldHoldManualTerminalLoop(
    manual: boolean,
    logicalAction: MenuItemKey | null,
    finalClip: string
  ): boolean;
  isLegalClipSequence(clips: readonly string[]): boolean;
  validateActionConfig(): string[];
};

function hasOwn(record: object, key: string): boolean {
  return Object.hasOwn(record, key);
}

export function validateActionConfig<
  ClipKey extends string,
  MenuItemKey extends string,
  Posture extends string,
>(config: ActionEngineConfig<ClipKey, MenuItemKey, Posture>): string[] {
  const errors: string[] = [];
  const clipKeys = new Set(Object.keys(config.clips));
  const menuItemKeys = new Set(Object.keys(config.menuItems));
  const postureKeys = new Set(Object.keys(config.postures));

  const requireClip = (clip: string, context: string) => {
    if (!clipKeys.has(clip)) {
      errors.push(`${context} references missing clip "${clip}"`);
    }
  };
  const requireMenuItem = (menuItem: string, context: string) => {
    if (!menuItemKeys.has(menuItem)) {
      errors.push(`${context} references missing menu item "${menuItem}"`);
    }
  };
  const requirePosture = (posture: string, context: string) => {
    if (!postureKeys.has(posture)) {
      errors.push(`${context} references missing posture "${posture}"`);
    }
  };
  const isLegalSequence = (clips: readonly string[]) => {
    if (clips.some((clip) => !clipKeys.has(clip))) return false;
    for (let index = 0; index < clips.length - 1; index += 1) {
      const from = clips[index] as ClipKey;
      const to = clips[index + 1]!;
      if (!config.clips[from].successors.includes(to as ClipKey)) {
        return false;
      }
    }
    return true;
  };

  requireClip(config.defaultClip, 'defaultClip');

  for (const [posture, metadata] of Object.entries(config.postures) as [
    Posture,
    { sustainedClips: readonly ClipKey[] },
  ][]) {
    for (const clip of metadata.sustainedClips) {
      requireClip(clip, `postures.${posture}.sustainedClips`);
      if (clipKeys.has(clip) && config.clips[clip].posture !== posture) {
        errors.push(
          `postures.${posture}.sustainedClips contains "${clip}" with posture "${config.clips[clip].posture}"`
        );
      }
    }
  }

  for (const [clipKey, clip] of Object.entries(config.clips) as [
    ClipKey,
    ActionEngineConfig<ClipKey, MenuItemKey, Posture>['clips'][ClipKey],
  ][]) {
    requirePosture(clip.posture, `clips.${clipKey}.posture`);
    requirePosture(clip.plannerPosture, `clips.${clipKey}.plannerPosture`);
    if (clip.logicalAction !== null) {
      requireMenuItem(clip.logicalAction, `clips.${clipKey}.logicalAction`);
    }
    for (const successor of clip.successors) {
      requireClip(successor, `clips.${clipKey}.successors`);
    }
  }

  for (const [menuItemKey, menuItem] of Object.entries(config.menuItems) as [
    MenuItemKey,
    ActionEngineConfig<ClipKey, MenuItemKey, Posture>['menuItems'][MenuItemKey],
  ][]) {
    if (menuItem.transitions.length === 0) {
      errors.push(`menuItems.${menuItemKey} has no transitions`);
    }
    const transitionPostures = new Set<Posture>();
    for (const transition of menuItem.transitions) {
      const context = `menuItems.${menuItemKey}.${transition.from}`;
      if (transitionPostures.has(transition.from)) {
        errors.push(`${context} defines more than one transition`);
      }
      transitionPostures.add(transition.from);
      requirePosture(transition.from, `${context}.from`);
      requirePosture(transition.to, `${context}.to`);
      for (const clip of transition.requires) {
        requireClip(clip, `${context}.requires`);
      }
      for (const clip of transition.play) {
        requireClip(clip, `${context}.play`);
        if (!transition.requires.includes(clip)) {
          errors.push(`${context}.play clip "${clip}" is not required`);
        }
      }
      if (transition.play.length === 0) {
        errors.push(`${context}.play must not be empty`);
        continue;
      }
      if (!isLegalSequence(transition.play)) {
        errors.push(`${context}.play contains an illegal successor chain`);
      }

      const firstClip = transition.play[0]!;
      const lastClip = transition.play[transition.play.length - 1]!;
      if (clipKeys.has(firstClip) && postureKeys.has(transition.from)) {
        const sustained = config.postures[transition.from].sustainedClips;
        const reachableFromSource = sustained.some(
          (sustainedClip) =>
            sustainedClip === firstClip ||
            (clipKeys.has(sustainedClip) &&
              config.clips[sustainedClip].successors.includes(firstClip))
        );
        if (!reachableFromSource) {
          errors.push(
            `${context}.play starts with "${firstClip}", which is unreachable from ${transition.from} sustained clips`
          );
        }
      }
      if (
        clipKeys.has(lastClip) &&
        config.clips[lastClip].posture !== transition.to
      ) {
        errors.push(
          `${context}.play ends on "${lastClip}" with posture "${config.clips[lastClip].posture}", expected "${transition.to}"`
        );
      }
    }
  }

  for (const menuItem of config.menuOrder) {
    requireMenuItem(menuItem, 'menuOrder');
  }
  for (const menuItem of menuItemKeys) {
    if (!config.menuOrder.includes(menuItem as MenuItemKey)) {
      errors.push(`menuOrder is missing menu item "${menuItem}"`);
    }
  }
  for (const menuItem of config.manualHoldActions) {
    requireMenuItem(menuItem, 'manualHoldActions');
  }

  for (const [posture, preferences] of Object.entries(
    config.autoplay.preferences
  ) as [Posture, readonly MenuItemKey[]][]) {
    requirePosture(posture, 'autoplay.preferences');
    for (const menuItem of preferences) {
      requireMenuItem(menuItem, `autoplay.preferences.${posture}`);
    }
  }
  for (const posture of postureKeys) {
    if (!hasOwn(config.autoplay.preferences, posture)) {
      errors.push(`autoplay.preferences is missing posture "${posture}"`);
    }
    if (!hasOwn(config.autoplay.dwellLoops, posture)) {
      errors.push(`autoplay.dwellLoops is missing posture "${posture}"`);
    }
  }
  for (const [posture, range] of Object.entries(config.autoplay.dwellLoops) as [
    Posture,
    { min: number; max: number },
  ][]) {
    requirePosture(posture, 'autoplay.dwellLoops');
    if (
      !Number.isInteger(range.min) ||
      !Number.isInteger(range.max) ||
      range.min < 1 ||
      range.max < range.min
    ) {
      errors.push(`autoplay.dwellLoops.${posture} has an invalid range`);
    }
  }
  for (const [previous, avoided] of Object.entries(
    config.autoplay.avoidAfter
  ) as [MenuItemKey, readonly MenuItemKey[]][]) {
    requireMenuItem(previous, 'autoplay.avoidAfter');
    for (const menuItem of avoided) {
      requireMenuItem(menuItem, `autoplay.avoidAfter.${previous}`);
    }
  }
  for (const [menuItem, allowed] of Object.entries(
    config.autoplay.allowRepeat
  )) {
    requireMenuItem(menuItem, 'autoplay.allowRepeat');
    if (typeof allowed !== 'boolean') {
      errors.push(`autoplay.allowRepeat.${menuItem} must be boolean`);
    }
  }

  for (const [section, chains] of [
    ['contractChains', config.contractChains],
    ['previewChains', config.previewChains],
  ] as const) {
    if (!chains) continue;
    for (const [chainKey, chain] of Object.entries(chains)) {
      for (const clip of chain) {
        requireClip(clip, `${section}.${chainKey}`);
      }
      if (!isLegalSequence(chain)) {
        errors.push(
          `${section}.${chainKey} contains an illegal successor chain`
        );
      }
    }
  }

  return errors;
}

export function createActionEngine<
  ClipKey extends string,
  MenuItemKey extends string,
  Posture extends string,
>(
  config: ActionEngineConfig<ClipKey, MenuItemKey, Posture>
): ActionEngine<ClipKey, MenuItemKey, Posture> {
  const clipKeys = new Set(Object.keys(config.clips));
  const defaultPosture = config.clips[config.defaultClip].posture;
  const defaultPlannerPosture = config.clips[config.defaultClip].plannerPosture;

  const availableClipKeys = (
    actions: readonly ActionClipRef[]
  ): Set<ClipKey> => {
    const available = new Set<ClipKey>();
    for (const action of actions) {
      if (clipKeys.has(action.key)) available.add(action.key as ClipKey);
    }
    return available;
  };

  const postureFromClipKey = (clipKey: string): Posture =>
    hasOwn(config.clips, clipKey)
      ? config.clips[clipKey as ClipKey].posture
      : defaultPosture;

  const plannerPostureFromClipKey = (clipKey: string): Posture =>
    hasOwn(config.clips, clipKey)
      ? config.clips[clipKey as ClipKey].plannerPosture
      : defaultPlannerPosture;

  const isLoopClip = (clipKey: string): boolean =>
    hasOwn(config.clips, clipKey) && config.clips[clipKey as ClipKey].loop;

  const logicalActionFromClipKey = (clipKey: string): MenuItemKey | null =>
    hasOwn(config.clips, clipKey)
      ? config.clips[clipKey as ClipKey].logicalAction
      : null;

  const isLegalClipSequence = (clips: readonly string[]): boolean => {
    if (clips.some((clip) => !clipKeys.has(clip))) return false;
    for (let index = 0; index < clips.length - 1; index += 1) {
      const from = clips[index] as ClipKey;
      const to = clips[index + 1]!;
      if (!config.clips[from].successors.includes(to as ClipKey)) {
        return false;
      }
    }
    return true;
  };

  const expandMenuAction = (
    menuItem: MenuItemKey,
    posture: Posture,
    availableClips: ReadonlySet<string>
  ): ExpandedAction<ClipKey, MenuItemKey, Posture> | null => {
    const item = config.menuItems[menuItem];
    if (!item) return null;
    const transition = item.transitions.find(
      (candidate) =>
        candidate.from === posture &&
        candidate.requires.every((clip) => availableClips.has(clip))
    );
    if (!transition) return null;
    return {
      clips: [...transition.play],
      logicalAction: menuItem,
      endingPosture: transition.to,
    };
  };

  const listMenuItems = (
    availableClips: ReadonlySet<string>,
    posture: Posture
  ): ActionMenuState<MenuItemKey>[] =>
    config.menuOrder.map((id) => {
      const item = config.menuItems[id];
      return {
        id,
        labelKey: item.labelKey,
        label: item.label,
        group: item.group,
        disabled: expandMenuAction(id, posture, availableClips) == null,
      };
    });

  const listAutoplayMenuItems = (
    availableClips: ReadonlySet<string>,
    posture: Posture
  ): MenuItemKey[] =>
    config.autoplay.preferences[posture].filter(
      (menuItem) => expandMenuAction(menuItem, posture, availableClips) != null
    );

  const pickAutoplayMenuItem = (
    availableClips: ReadonlySet<string>,
    posture: Posture,
    previous: MenuItemKey | null,
    random: () => number = Math.random
  ): MenuItemKey | null => {
    const options = listAutoplayMenuItems(availableClips, posture);
    if (options.length === 0) return null;

    let filtered = options;
    if (previous) {
      const avoided = new Set(config.autoplay.avoidAfter[previous] ?? []);
      filtered = options.filter((menuItem) => {
        if (avoided.has(menuItem)) return false;
        if (
          config.autoplay.avoidImmediateRepeat &&
          menuItem === previous &&
          config.autoplay.allowRepeat[menuItem] !== true
        ) {
          return false;
        }
        return true;
      });
    }

    const pool = filtered.length > 0 ? filtered : options;
    const index = Math.floor(random() * pool.length);
    return pool[index] ?? null;
  };

  const defaultDwellLoops = (
    clipKey: string,
    random: () => number = Math.random
  ): number => {
    if (!isLoopClip(clipKey)) return 1;
    const posture = postureFromClipKey(clipKey);
    const range = config.autoplay.dwellLoops[posture];
    return range.min + Math.floor(random() * (range.max - range.min + 1));
  };

  const manualHoldActions = new Set(config.manualHoldActions);
  const shouldHoldManualTerminalLoop = (
    manual: boolean,
    logicalAction: MenuItemKey | null,
    finalClip: string
  ): boolean =>
    manual &&
    logicalAction !== null &&
    manualHoldActions.has(logicalAction) &&
    isLoopClip(finalClip);

  return {
    config,
    availableClipKeys,
    initialClipKey(actions) {
      const available = availableClipKeys(actions);
      if (available.has(config.defaultClip)) return config.defaultClip;
      for (const action of actions) {
        if (available.has(action.key as ClipKey)) {
          return action.key as ClipKey;
        }
      }
      return null;
    },
    postureFromClipKey,
    plannerPostureFromClipKey,
    isLoopClip,
    logicalActionFromClipKey,
    expandMenuAction,
    listMenuItems,
    listAutoplayMenuItems,
    pickAutoplayMenuItem,
    defaultDwellLoops,
    shouldHoldManualTerminalLoop,
    isLegalClipSequence,
    validateActionConfig: () => validateActionConfig(config),
  };
}
