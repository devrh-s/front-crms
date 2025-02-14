import { useCallback, useState } from 'react';
import { ITabBookmark } from '@/components/default/common/types';

export default function useTabBookmarks(defaultTab: string = 'Profile') {
  const [tabs, setTabs] = useState<ITabBookmark[] | null>(null);
  const [activeBookmark, setActiveBookmark] = useState<string>(defaultTab);

  const changeActiveBookmark = useCallback(
    (newTab: string) => {
      if (!tabs || tabs.length === 0) return;

      const tabExists = tabs?.some((tab) => tab.name === newTab);

      if (tabExists) {
        setActiveBookmark(newTab);
      }
    },
    [tabs]
  );

  return {
    activeBookmark,
    tabs,
    setTabs,
    changeActiveBookmark,
  };
}
