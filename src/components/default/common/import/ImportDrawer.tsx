import { useState, useEffect, useReducer, useMemo, Reducer } from 'react';
import {
  Drawer,
  Stack,
  IconButton,
  useMediaQuery,
  Theme,
  Typography,
  LinearProgress,
} from '@mui/material';
import ImportDownload from './ImportDownload';
import ImportColumnMatch from './ImportColumnMatch';
import ImportLoader from './IImportLoader';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useCustomizerStore } from '@/zustand/customizerStore';
import { IImportState, IImportData } from './types';

interface IActionsDrawerProps {
  visible: boolean;
  pageName: string;
  hide: () => void;
}

const initialState: IImportState = {
  step: 1,
  data: null,
  loading: false,
  skipped: [],
  error: null,
};

// prettier-ignore
const exceptionWarnings = {
  'job posts': [
    'Publish date format should be in d-m-Y h:m:s (e.g. 21-04-2022 12:00:00) format. Make sure the date format is correct in the excel file.',
  ],
  'entity blocks': [
    'Entity Block should look like "Users -> Profile", where Users - entity and Profile - block.',
  ],
  'job applications': [
    "Gender field should be one of such types: 'male', 'female', 'unknown'.",
    'Is Talent fields should be 1 or 0.',
  ],
};

function importReducer(state: IImportState, action: { type: string; payload?: any }) {
  switch (action.type) {
    case 'move_back':
      return { ...state, step: state.step > 1 ? state.step - 1 : 1 };
    case 'loading':
      return { ...state, loading: action?.payload };
    case 'set_data':
      return {
        ...state,
        step: state.step + 1,
        data: action?.payload ?? state.data,
      };
    case 'set_skipped':
      return {
        ...state,
        skipped: action.payload,
      };
    case 'set_error':
      return { ...state, error: action?.payload ?? state.error };
    case 'reset':
      return initialState;
    default:
      return state;
  }
}

export default function ImportDrawer({ visible, pageName, hide }: IActionsDrawerProps) {
  const [state, dispatch] = useReducer(importReducer, initialState);
  const [fullScreen, setFullScreen] = useState(false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const importUrl = useMemo(() => pageName?.toLowerCase().replace(/\s/, '-'), [pageName]);

  const {
    sidebar: { width: sidebarWidth },
  } = useCustomizerStore();

  const currentExceptionWarnings =
    exceptionWarnings[pageName?.toLocaleLowerCase() as keyof typeof exceptionWarnings] ?? [];

  const getDrawerWidth = () => {
    if (!mdDown) {
      if (!fullScreen) return 450;
      return sidebarWidth === 286 ? '65dvw' : '80dvw';
    }
    return 375;
  };

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const moveBack = () => dispatch({ type: 'move_back' });

  const setLoading = (isLoaded: boolean) => dispatch({ type: 'loading', payload: isLoaded });

  const setSkipped = (skippedColumns: number[]) =>
    dispatch({ type: 'set_skipped', payload: skippedColumns });

  const setImportData = (data: IImportData) => dispatch({ type: 'set_data', payload: data });

  const setImportError = (error: string) => dispatch({ type: 'set_error', payload: error });

  const reset = () => dispatch({ type: 'reset' });

  const handleHide = () => {
    hide();
    reset();
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
      onClose={handleHide}
      sx={{
        '& .MuiPaper-root': {
          overflow: 'unset',
        },
      }}
      ModalProps={{
        disableScrollLock: false,
      }}
    >
      <Stack
        gap='1rem'
        sx={{
          width: getDrawerWidth(),
          height: '100%',
          padding: '2rem 2rem 0',
          position: 'relative',
          overflowY: 'auto',
          paddingBottom: '1rem',
        }}
        role='presentation'
      >
        {state.loading && (
          <LinearProgress
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '.3rem',
              width: '100%',
            }}
          />
        )}
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
            <IconButton color='error' onClick={handleHide}>
              <CloseIcon />
            </IconButton>
          )}
        </Stack>
        <Typography variant='h5' textTransform='capitalize'>
          Import&nbsp;{pageName}
        </Typography>
        <Stack
          sx={{
            backgroundColor: (theme) => theme.palette.warning.light,
            color: '#fff',
            padding: '1rem',
            borderRadius: '.5rem',
          }}
        >
          {currentExceptionWarnings.map((warning, ind) => (
            <Typography key={ind}>{warning}</Typography>
          ))}
          <Typography>
            Date format should be in d-m-Y (e.g. 21-04-2022) format. Make sure the date format is
            correct in the excel file.
          </Typography>
        </Stack>
        {state.step === 1 && (
          <ImportDownload
            state={state}
            importUrl={importUrl}
            setLoading={setLoading}
            setImportData={setImportData}
            setImportError={setImportError}
          />
        )}
        {state.step === 2 && (
          <ImportColumnMatch
            state={state}
            setImportData={setImportData}
            setSkipped={setSkipped}
            setImportError={setImportError}
            moveBack={moveBack}
          />
        )}
        {state.step === 3 && (
          <ImportLoader
            pageName={pageName}
            state={state}
            importUrl={importUrl}
            handleHide={handleHide}
            reset={reset}
          />
        )}
      </Stack>
    </Drawer>
  );
}
