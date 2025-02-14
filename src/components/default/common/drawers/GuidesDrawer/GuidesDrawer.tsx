import { useEffect, ReactNode } from 'react';
import {
  Drawer,
  Stack,
  IconButton,
  Typography,
  useMediaQuery,
  Theme,
  LinearProgress,
} from '@mui/material';
import CustomBookmarks from '../../UI/CustomBookmarks/CustomBookmarks';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useCustomizerStore } from '@/zustand/customizerStore';
import { IBookmark } from '../../types';

interface IGuidesDrawerProps {
  title?: string;
  visible: boolean;
  activeBookmark: string;
  bookmarks: Array<IBookmark>;
  children: ReactNode;
  isLoading?: boolean;
  fullScreen: boolean;
  hideHandler: () => void;
  fullScreenHandler: () => void;
  changeActiveBookmark: (newBookmark: string) => void;
  toggleBookmarkError: (name?: string) => void;
}

export default function GuidesDrawer({
  title,
  visible,
  bookmarks,
  activeBookmark,
  fullScreen,
  children,
  hideHandler,
  fullScreenHandler,
  toggleBookmarkError,
  changeActiveBookmark,
  isLoading = false,
}: IGuidesDrawerProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const {
    sidebar: { width: sidebarWidth },
  } = useCustomizerStore();

  const getDrawerWidth = () => {
    if (!mdDown) {
      if (!fullScreen) return 450;
      return sidebarWidth === 286 ? '65dvw' : '80dvw';
    }
    return 375;
  };

  useEffect(() => {
    const body = document.querySelector('body') as HTMLElement;
    if (visible) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = '';
    }
  }, [visible]);

  useEffect(() => {
    if (mdDown) {
      fullScreenHandler();
    }
  }, [mdDown]);

  return (
    <Drawer
      anchor='right'
      open={visible}
      onClose={hideHandler}
      sx={{
        '& .MuiPaper-root': {
          overflow: 'unset',
        },
      }}
      ModalProps={{
        disableScrollLock: false,
      }}
    >
      <CustomBookmarks
        fullScreen={fullScreen}
        activeBookmark={activeBookmark}
        changeActiveBookmark={changeActiveBookmark}
        toggleBookmarkError={toggleBookmarkError}
        bookmarks={bookmarks}
      >
        <Stack
          gap='1rem'
          sx={{
            width: getDrawerWidth(),
            height: '100%',
            padding: mdDown || fullScreen ? '2rem 2rem 0' : '1rem 2rem 0',
            position: 'relative',
            overflowY: 'auto',
            paddingBottom: '1rem',
          }}
          role='presentation'
        >
          <Stack
            flexDirection='row'
            sx={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              zIndex: 100,
            }}
          >
            {!mdDown && (
              <IconButton onClick={fullScreenHandler}>
                {fullScreen ? (
                  <FullscreenExitIcon color='primary' />
                ) : (
                  <FullscreenIcon color='primary' />
                )}
              </IconButton>
            )}
            {(mdDown || fullScreen) && (
              <IconButton color='error' onClick={hideHandler}>
                <CloseIcon />
              </IconButton>
            )}
          </Stack>
          {title && (
            <Typography
              sx={{
                fontSize: '1.2rem',
                textAlign: fullScreen ? 'center' : 'left',
                fontWeight: 500,
              }}
            >
              {title}
            </Typography>
          )}
          {isLoading && <LinearProgress sx={{ minHeight: 4 }} />}
          {children}
        </Stack>
      </CustomBookmarks>
    </Drawer>
  );
}
