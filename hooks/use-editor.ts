'use client';

import { useCallback, useMemo, useReducer } from 'react';
import {
  GeometryError,
  addRoom,
  changeRoomType,
  fitAndRebalance,
  measure,
  moveSplit,
  removeRoom,
  renameRoom,
  validateHouse,
} from '@/lib/geometry';
import type { RoomTypeRule, TreeNode } from '@/lib/geometry/types';
import { houseFrom } from '@/lib/house';
import type { GeometryState, Style } from '@/types/domain';

const HISTORY_LIMIT = 50;

interface State {
  past: GeometryState[];
  present: GeometryState;
  future: GeometryState[];
  error: { code: string; message: string } | null;
  mergeKey: string | null;
}

type Action =
  | { type: 'apply'; next: GeometryState; mergeKey?: string }
  | { type: 'fail'; error: { code: string; message: string } }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset'; geometry: GeometryState }
  | { type: 'commit' }
  | { type: 'dismiss' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'apply': {
      const merging = action.mergeKey !== undefined && action.mergeKey === state.mergeKey;

      return {
        past: merging ? state.past : [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: action.next,
        future: [],
        error: null,
        mergeKey: action.mergeKey ?? null,
      };
    }

    case 'fail':
      return { ...state, error: action.error };

    case 'undo': {
      const previous = state.past.at(-1);
      if (!previous) return state;

      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
        error: null,
        mergeKey: null,
      };
    }

    case 'redo': {
      const [next, ...rest] = state.future;
      if (!next) return state;

      return {
        past: [...state.past, state.present],
        present: next,
        future: rest,
        error: null,
        mergeKey: null,
      };
    }

    case 'reset':
      return { past: [], present: action.geometry, future: [], error: null, mergeKey: null };

    case 'commit':
      return state.mergeKey === null ? state : { ...state, mergeKey: null };

    case 'dismiss':
      return { ...state, error: null };
  }
};

export interface EditorOptions {
  rules: Record<string, RoomTypeRule>;
  style?: Style | null;
}

const useEditor = (initial: GeometryState, options: EditorOptions) => {
  const [state, dispatch] = useReducer(reducer, {
    past: [],
    present: initial,
    future: [],
    error: null,
    mergeKey: null,
  });

  const { rules, style } = options;
  const ready = Object.keys(rules).length > 0;

  const edit = useCallback(
    (level: number, transform: (tree: TreeNode) => TreeNode, mergeKey?: string) => {
      if (!ready) return;

      try {
        const floors = state.present.floors.map((floor) =>
          floor.level === level ? { ...floor, tree: transform(floor.tree as TreeNode) } : floor,
        );

        dispatch({ type: 'apply', next: { ...state.present, floors }, mergeKey });
      } catch (error) {
        if (error instanceof GeometryError) {
          dispatch({ type: 'fail', error: { code: error.code, message: error.message } });
          return;
        }
        throw error;
      }
    },
    [ready, state.present],
  );

  const splitOptions = useMemo(() => ({ rules }), [rules]);

  const actions = useMemo(
    () => ({
      addRoom: (level: number, roomType: string) =>
        edit(level, (tree) =>
          addRoom(tree, state.present.bounds, roomType, splitOptions),
        ),

      removeRoom: (level: number, roomId: string) =>
        edit(level, (tree) => removeRoom(tree, roomId)),

      changeRoomType: (level: number, roomId: string, roomType: string) =>
        edit(level, (tree) => changeRoomType(tree, roomId, roomType)),

      renameRoom: (level: number, roomId: string, label: string) =>
        edit(level, (tree) => renameRoom(tree, roomId, label)),

      moveSplit: (level: number, splitId: string, ratio: number) =>
        edit(
          level,
          (tree) => moveSplit(tree, splitId, ratio, state.present.bounds, splitOptions),
          `move:${level}:${splitId}`,
        ),

      resize: (width: number, length: number) => {
        if (!ready) return;

        const bounds = { ...state.present.bounds, width, length };

        try {
          const floors = state.present.floors.map((floor) => ({
            ...floor,
            tree: fitAndRebalance(floor.tree as TreeNode, bounds, splitOptions).tree,
          }));

          dispatch({ type: 'apply', next: { ...state.present, bounds, floors } });
        } catch (error) {
          if (error instanceof GeometryError) {
            dispatch({ type: 'fail', error: { code: error.code, message: error.message } });
            return;
          }
          throw error;
        }
      },

      endMove: () => dispatch({ type: 'commit' }),
      undo: () => dispatch({ type: 'undo' }),
      redo: () => dispatch({ type: 'redo' }),
      reset: (geometry: GeometryState) => dispatch({ type: 'reset', geometry }),
      dismissError: () => dispatch({ type: 'dismiss' }),
    }),
    [edit, ready, splitOptions, state.present],
  );

  const derived = useMemo(() => {
    if (!ready) return null;

    const house = houseFrom(state.present, { rules, style });

    return {
      house,
      validation: validateHouse(house, { rules }),
      measurements: measure(house),
    };
  }, [ready, state.present, rules, style]);

  return {
    geometry: state.present,
    ...actions,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    error: state.error,
    house: derived?.house ?? null,
    validation: derived?.validation ?? null,
    measurements: derived?.measurements ?? null,
  };
};

export { useEditor };
