'use client';
import update, { Spec } from 'immutability-helper';
import { useMemo, createContext, PropsWithChildren } from 'react';

export const TasksContext = createContext<any>(null);

interface ITaskContextProps extends PropsWithChildren {
  elems: any[];
  selectedIds: number[];
  hierarchy: string[];
  actionOptions: Record<string, Function>;
  updateElems: (newTasks: any[]) => void;
}

export function TasksContextProvider({
  elems,
  selectedIds,
  hierarchy,
  children,
  actionOptions,
  updateElems,
}: ITaskContextProps) {
  const mutateElemsList = (spec: Spec<any>) => {
    updateElems(update(elems, spec));
  };

  const generateNameKey = ({
    key,
    indexes,
    hierarchy,
  }: {
    key: string;
    indexes: number[];
    hierarchy: string[];
  }) => hierarchy.map((el, ind) => `${el}[${indexes[ind]}]`).join('.') + `.${key}`;

  const generateNameKeys = ({
    level,
    indexes,
    keys,
  }: {
    level: string;
    indexes: number[];
    keys: string[];
  }) => {
    const levelInd = hierarchy.indexOf(level);
    if (levelInd === -1) {
      throw new Error(`Level "${level}" not found in hierarchy`);
    }
    const filteredIndexes = indexes.filter((ind) => Number.isInteger(ind));
    const relevantHierarchy = hierarchy.slice(0, levelInd + 1);
    return Object.fromEntries(
      keys.map((key) => [
        key,
        generateNameKey({ key, indexes: filteredIndexes, hierarchy: relevantHierarchy }),
      ])
    );
  };

  const contextValue = useMemo(
    () => ({
      elems,
      selectedIds,
      actionOptions,
      generateNameKeys,
      mutateElemsList,
    }),
    [elems, selectedIds]
  );

  return <TasksContext.Provider value={contextValue}>{children}</TasksContext.Provider>;
}
