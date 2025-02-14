import { useCustomizerStore } from '@/zustand/customizerStore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import DrawIcon from '@mui/icons-material/Draw';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import HistoryIcon from '@mui/icons-material/History';
import {
  Button,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Theme,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Dispatch, FormEvent, ReactNode, SetStateAction, useEffect, useState } from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import CreateInfo from '../../components/CreateInfo';
import CustomLabel from '../../form/CustomLabel/CustomLabel';
import { IBookmark } from '../../types';
import CustomBookmarks from '../../UI/CustomBookmarks/CustomBookmarks';
import ActionsSkeleton from './ActionsSkeleton';

interface IActionsDrawerProps {
  title?: string;
  visible: boolean;
  id?: number | string | null;
  activeBookmark: string;
  bookmarks: Array<IBookmark>;
  creationInfo?: ICreationInfo | null;
  fullScreen: boolean;
  children: ReactNode;
  errors: FieldErrors<any>;
  isCreateVisible?: boolean;
  isCopy?: boolean;
  isLoading?: boolean;
  isDraft?: boolean;
  isDuplicate?: boolean;
  hideHandler: (clearOnClose?: boolean) => void;
  resetHandler?: () => void;
  submitForm?: (e: FormEvent) => void;
  fullScreenHandler: () => void;
  changeActiveBookmark: (newBookmark: string) => void;
  toggleBookmarkError: (name?: string) => void;
  register: UseFormRegister<any>;
  toggleDraft?: Dispatch<SetStateAction<boolean>>;
}

export default function ActionsDrawer({
  id,
  title,
  errors,
  visible,
  creationInfo,
  bookmarks,
  activeBookmark,
  fullScreen,
  children,
  isCopy = false,
  isCreateVisible = true,
  isLoading = false,
  isDraft,
  isDuplicate,
  register,
  resetHandler,
  hideHandler,
  submitForm,
  fullScreenHandler,
  toggleBookmarkError,
  changeActiveBookmark,
  toggleDraft,
}: IActionsDrawerProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const {
    sidebar: { width: sidebarWidth },
  } = useCustomizerStore();
  const [activeBookmarkColor, setActiveBookmarkColor] = useState<string>('#000');
  const isNew = id && !isCopy && !isDuplicate;

  const getDrawerWidth = () => {
    if (!mdDown) {
      if (!fullScreen) return 450;
      return sidebarWidth === 286 ? '65dvw' : '80dvw';
    }
    return 375;
  };

  const closeDrawerHandler = () => {
    if (!id) {
      return hideHandler(false);
    }
    hideHandler();
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

  useEffect(() => {
    if (activeBookmark && bookmarks) {
      const color = bookmarks.find((el) => el.name === activeBookmark)?.color;
      setActiveBookmarkColor(color ? color : '#000');
    }
  }, [bookmarks, activeBookmark]);

  return (
    <Drawer
      anchor='right'
      open={visible}
      onClose={closeDrawerHandler}
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
            {toggleDraft && (
              <IconButton
                color={isDraft ? 'warning' : 'primary'}
                onClick={() => toggleDraft(!isDraft)}
              >
                <DrawIcon />
              </IconButton>
            )}
            {resetHandler && (
              <Tooltip title='Reset'>
                <IconButton color='primary' onClick={resetHandler}>
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
            )}
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
              <IconButton color='error' onClick={closeDrawerHandler}>
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
          {isLoading && <ActionsSkeleton />}
          {!isLoading && (
            <>
              {submitForm ? (
                <form
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem',
                    paddingTop: '1rem',
                    flex: 1,
                  }}
                  autoComplete='off'
                  onSubmit={submitForm}
                >
                  <CreateInfo id={id} creationInfo={creationInfo} />
                  {isNew && (
                    <TextField
                      variant='standard'
                      InputLabelProps={{ shrink: true }}
                      label={<CustomLabel label='Reason' />}
                      className={mdDown ? 'mobile' : ''}
                      {...register('reason')}
                      error={!!errors.reason}
                      helperText={errors?.reason ? (errors.reason?.message as string) : ''}
                      sx={{
                        width: '100%',
                        maxWidth: 380,
                        '&.mobile': {
                          width: 'auto',
                          flex: '1',
                        },
                      }}
                    />
                  )}
                  <Stack
                    flexWrap='wrap'
                    gap='1.5rem'
                    flexDirection={fullScreen ? 'row' : 'column'}
                    sx={{
                      width: '100%',
                    }}
                  >
                    {children}
                  </Stack>
                  <Stack
                    className={mdDown ? 'mobile' : ''}
                    sx={{
                      display: isCreateVisible ? 'flex' : 'none',
                      flex: 1,
                      position: 'relative',
                      paddingBottom: '2px',
                      justifyContent: 'flex-end',
                      width: '100%',
                    }}
                  >
                    <Button
                      variant='contained'
                      size='large'
                      type='submit'
                      className={mdDown ? 'mobile' : ''}
                      disabled={isLoading}
                      sx={{
                        alignSelf: fullScreen ? 'center' : 'unset',
                        minWidth: '340px',
                        '&.mobile': {
                          minWidth: '0',
                        },
                      }}
                      endIcon={<AddCircleOutlineIcon />}
                    >
                      {isNew ? 'Update' : 'Create'}
                    </Button>
                  </Stack>
                </form>
              ) : (
                children
              )}
            </>
          )}
        </Stack>
      </CustomBookmarks>
    </Drawer>
  );
}
