import { BookmarkName } from '@/hooks/useBookmarks';

export const getActiveBookmark = (priority: string, translation: string): BookmarkName => {
  const priorityName = priority.toLowerCase();
  const translationISO = translation.toLowerCase();
  if (priorityName === 'primary' && translationISO === 'en') {
    return 'group';
  }
  if (priorityName === 'secondary' && translationISO === 'en') {
    return 'similar';
  }
  return 'translation';
};

export const getDisabledBookmark = (
  activeBookmark: BookmarkName
): BookmarkName | BookmarkName[] => {
  if (activeBookmark === 'similar') {
    return ['group', 'translation'];
  }
  if (activeBookmark === 'translation') {
    return ['group', 'similar'];
  }
  return ['similar', 'translation'];
};
