import { IBookmark } from '@/components/default/common/types';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import ChatIcon from '@mui/icons-material/Chat';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ContactsIcon from '@mui/icons-material/Contacts';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import ImageIcon from '@mui/icons-material/Image';
import LanguageIcon from '@mui/icons-material/Language';
import PaymentsIcon from '@mui/icons-material/Payments';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import TaskIcon from '@mui/icons-material/Task';
import TextsmsIcon from '@mui/icons-material/Textsms';
import TopicIcon from '@mui/icons-material/Topic';
import SplitscreenIcon from '@mui/icons-material/Splitscreen';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import { ReactElement, useEffect, useState } from 'react';

export type BookmarkName =
  | 'profile'
  | 'pricing'
  | 'group'
  | 'translation'
  | 'contact'
  | 'formats'
  | 'communication'
  | 'task'
  | 'milestone'
  | 'steps'
  | 'step_templates'
  | 'task_templates'
  | 'trackers'
  | 'edits'
  | 'activities'
  | 'language'
  | 'cv'
  | 'content'
  | 'profession'
  | 'rate'
  | 'salary'
  | 'results'
  | 'job_template'
  | 'price'
  | 'destinations'
  | 'similar'
  | 'checklists'
  | 'progress'
  | 'rules'
  | 'text'
  | 'video'
  | 'comment'
  | 'image';

interface IBookmarkDataItem {
  name: BookmarkName;
  color: string;
  icon: ReactElement;
  disabled: boolean;
  error: boolean;
}

const bookmarksData: IBookmarkDataItem[] = [
  {
    name: 'profile',
    color: '#1e88e5',
    icon: <CreateNewFolderIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'pricing',
    color: '#512da8',
    icon: <AttachMoneyIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'group',
    color: '#512da8',
    icon: <FiberNewIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'similar',
    color: '#bd8202',
    icon: <CallSplitIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'translation',
    color: '#00897b',
    icon: <LanguageIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'contact',
    color: '#4caf50',
    icon: <ContactsIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'communication',
    color: '#ff9800',
    icon: <ChatIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'formats',
    color: '#4caf50',
    icon: <TopicIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'task',
    color: '#4caf50',
    icon: <TaskIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'milestone',
    color: '#5d4037',
    icon: <SplitscreenIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'steps',
    color: '#4caf50',
    icon: <TaskIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'step_templates',
    color: '#4caf50',
    icon: <TaskIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'task_templates',
    color: '#4caf50',
    icon: <TaskIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'edits',
    color: '#512da8',
    icon: <EditNoteIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'trackers',
    color: '#ff9800',
    icon: <AccessTimeIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'activities',
    color: '#00897b',
    icon: <EditCalendarIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'language',
    color: '#00897b',
    icon: <LanguageIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'cv',
    color: '#512da8',
    icon: <EditNoteIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'content',
    color: '#ff9800',
    icon: <CreateNewFolderIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'profession',
    color: '#0670ca',
    icon: <WorkIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'comment',
    color: '#ca0678',
    icon: <TextsmsIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'rate',
    color: '#499fe4',
    icon: <TrendingUpIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'salary',
    color: '#ffc107',
    icon: <PaymentsIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'price',
    color: '#2da842',
    icon: <AttachMoneyIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'results',
    color: '#ff5722',
    icon: <BookmarkAddedIcon sx={{ color: '#fff' }} />,
    error: false,
    disabled: false,
  },
  {
    name: 'job_template',
    color: '#512da8',
    icon: <WorkHistoryIcon sx={{ color: '#fff' }} />,
    disabled: true,
    error: false,
  },
  {
    name: 'destinations',
    color: '#512da8',
    icon: <WorkHistoryIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'progress',
    color: '#a0a82d',
    icon: <PublishedWithChangesIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'checklists',
    color: '#a0a82d',
    icon: <ChecklistIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'rules',
    color: '#2da842',
    icon: <TopicIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'text',
    color: '#ff9800',
    icon: <EditNoteIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'video',
    color: '#512da8',
    icon: <PlayCircleIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
  {
    name: 'image',
    color: '#00897b',
    icon: <ImageIcon sx={{ color: '#fff' }} />,
    disabled: false,
    error: false,
  },
];

export default function useBookmarks(bookmarksNames: Array<BookmarkName>, visible: boolean) {
  const [bookmarks, setBookmarks] = useState<IBookmark[]>(
    bookmarksData.filter((elem) => bookmarksNames.includes(elem.name))
  );
  const [activeBookmark, setActiveBookmark] = useState(bookmarks[0].name ?? 'profile');

  const toggleBookmarkError = (value?: string | string[]) => {
    const newBookmarks = bookmarks.map((bookmark) => {
      if (Array.isArray(value) && value.includes(bookmark.name)) {
        return { ...bookmark, error: true };
      }
      if (bookmark.name === value && !bookmark.disabled) {
        return { ...bookmark, error: true };
      }
      if (!value || typeof value !== 'string') {
        return { ...bookmark, error: false };
      }
      return bookmark;
    });
    setBookmarks(newBookmarks);
  };

  const toggleInteraction = (name?: BookmarkName | BookmarkName[]) => {
    const newBookmarks = bookmarks.map((bookmark) => {
      if (!name) {
        return { ...bookmark, disabled: false };
      }
      if (Array.isArray(name)) {
        if (name.includes(bookmark.name as BookmarkName)) {
          return { ...bookmark, disabled: true };
        }
        return { ...bookmark, disabled: false };
      }
      if (bookmark.name === name) {
        return { ...bookmark, disabled: true };
      }
      return bookmark;
    });
    setBookmarks(newBookmarks);
  };

  const getBookmarkErrorName = (relations: { [name: string]: string[] }, errors: string[]) => {
    return [
      ...new Set<string>(
        errors.map((error) => {
          for (let [bookmarkName, errorNames] of Object.entries(relations)) {
            for (let errorName of errorNames) {
              if ((bookmarkName !== 'profile' && error.match(errorName)) || errorName === error) {
                return bookmarkName;
              }
            }
          }
          return 'profile';
        })
      ),
    ];
  };

  useEffect(() => {
    if (!visible) {
      toggleBookmarkError();
    }
  }, [visible]);

  const changeActiveBookmark = (newBookmark: string) => setActiveBookmark(newBookmark);

  return {
    activeBookmark,
    bookmarks,
    toggleInteraction,
    toggleBookmarkError,
    getBookmarkErrorName,
    changeActiveBookmark,
  };
}
