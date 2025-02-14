import { Stack, Box, Button, useMediaQuery, Theme } from '@mui/material';
import { IBookmark } from '../../types';

interface ICustomBookmarks {
  fullScreen: boolean;
  bookmarks: Array<IBookmark>;
  activeBookmark: string;
  children: JSX.Element | Array<JSX.Element | false> | false;
  changeActiveBookmark: (newBookmark: string) => void;
  toggleBookmarkError: (name?: string) => void;
}

export default function CustomBookmarks({
  fullScreen,
  activeBookmark,
  bookmarks,
  children,
  toggleBookmarkError,
  changeActiveBookmark,
}: ICustomBookmarks) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const isDefault = mdDown || fullScreen;
  const getTransform = (bookmark: IBookmark) => {
    if (!isDefault) {
      return activeBookmark === bookmark.name ? 'translateX(-100%)' : 'translateX(-2.5rem)';
    }
    return 'translateX(0)';
  };

  const bookmarkClick = (name: string) => {
    toggleBookmarkError();
    changeActiveBookmark(name);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        backgroundColor: '#fff',
      }}
    >
      <Stack
        gap='.5rem'
        sx={{
          position: 'absolute',
          top: !isDefault ? '.5rem' : 0,
          left: !isDefault ? 0 : '1rem',
          zIndex: isDefault ? 5 : -1,
          flexDirection: !isDefault ? 'column' : 'row',
        }}
      >
        {bookmarks.map((bookmark, index) => (
          <Button
            key={index}
            disabled={bookmark.disabled}
            sx={{
              textWrap: 'nowrap',
              display: 'flex',
              textTransform: 'capitalize',
              alignItems: 'center',
              width: 'min-content',
              maxHeight: !isDefault || activeBookmark === bookmark.name ? 'unset' : '1.8rem',
              gap: '.5rem',
              color: activeBookmark === bookmark.name ? '#fff' : 'transparent',
              backgroundColor: (theme) =>
                bookmark?.error ? theme.palette.error.main : bookmark.color,
              transition: 'all .2s ease-in',
              transform: getTransform(bookmark),
              border: !isDefault ? '1px solid' : 'none',
              borderRight: 'none',
              borderColor: (theme) => (bookmark?.error ? theme.palette.error.main : 'transparent'),
              cursor: 'pointer',
              '&:hover': {
                borderColor: '#fff',
                backgroundColor: isDefault ? bookmark.color : 'transparent',
              },
              '&:disabled': {
                backgroundColor: '#9e9e9e',
              },
              '&.MuiButtonBase-root': {
                borderRadius: 0,
                borderTopLeftRadius: !isDefault ? '5px' : 0,
                borderBottomLeftRadius: '5px',
                borderTopRightRadius: 0,
                borderBottomRightRadius: isDefault ? '5px' : 0,
                minWidth: 'unset',
              },
            }}
            onClick={() => bookmarkClick(bookmark.name)}
          >
            {bookmark.icon}
            {!isDefault && `${bookmark.name.replace(/_/g, ' ')}`}
          </Button>
        ))}
      </Stack>
      {children}
    </Box>
  );
}
