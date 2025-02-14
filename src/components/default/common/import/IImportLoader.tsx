import { useState, useEffect, useRef } from 'react';
import {
  Button,
  Typography,
  Box,
  Stack,
  useMediaQuery,
  Theme,
  LinearProgress,
  LinearProgressProps,
  List,
  ListItemText,
  styled,
} from '@mui/material';
import { IImportState, IImportData, IColumn } from './types';
import { apiSetData, apiGetData } from '@/lib/fetch';
import useNotification from '@/hooks/useNotification';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryName } from '@/lib/helpers';

interface IIimportDOwnloadProps {
  state: IImportState;
  importUrl?: string;
  pageName: string;
  reset: () => void;
  handleHide: () => void;
}

interface IStatisticks {
  processedJobs: number;
  failedJobs: number;
  totalJobs: number;
}

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Stack sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant='determinate' {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          sx={{ color: 'text.secondary', fontSize: '1.4rem' }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Stack>
  );
}

export default function ImportLoader({
  state,
  importUrl,
  pageName,
  reset,
  handleHide,
}: IIimportDOwnloadProps) {
  const [progress, setProgress] = useState(0);
  const [statistics, setStatistics] = useState<IStatisticks>();
  const [errors, setErrors] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const queryName = getQueryName(pageName);
  const resetFlag = useRef<boolean>(false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const showNotification = useNotification();
  const isFinished = statistics?.totalJobs && statistics?.totalJobs === statistics?.processedJobs;

  const resetHandler = () => {
    resetFlag.current = true;
    reset();
  };

  const getProcessProgress = async (name: string, id: string) => {
    const result = await apiGetData(`import/process/${name}/${id}`);
    if (resetFlag.current) return;
    setProgress(result.progress);
    setStatistics({
      processedJobs: result?.processedJobs ?? 0,
      failedJobs: result?.failedJobs ?? 0,
      totalJobs: result?.totalJobs ?? 0,
    });
    if (result.progress !== 100) {
      getProcessProgress(name, id);
    } else if (result.progress === 100 && result?.failedJobs) {
      const { exceptions } = await apiGetData(`import/exception/${name}`);
      setErrors(exceptions.map((elem: any, index: number) => `${index + 1}. ${elem.exception}`));
    }
    queryClient.invalidateQueries({
      queryKey: [queryName],
    });
  };

  const startLoading = async () => {
    const result = await apiSetData(`${importUrl}/import/process`, {
      columns: state.data?.columns,
      file: state.data?.file,
      shiftedColumns: state.skipped,
      has_heading: state.data?.hasHeading ? 1 : 0,
    });
    if (!result.success || resetFlag.current) {
      console.log('Loading interrupted', result);
    } else {
      const {
        batch: { id, name },
      } = result;
      getProcessProgress(name, id);
    }
  };

  useEffect(() => {
    startLoading();
  }, []);

  useEffect(() => {
    let timerId: any;
    if (isFinished) {
      timerId = setTimeout(() => {
        handleHide();
      }, 3000);
    }
    return () => timerId && clearTimeout(timerId);
  }, [isFinished]);

  return (
    <Stack justifyContent='center' gap='1rem'>
      <Stack flexDirection='row' justifyContent='space-between'>
        <Stack flexDirection='row' alignItems='center' gap='.5rem'>
          <Typography>Total Jobs:</Typography>
          <Typography fontSize='1.2rem'>{statistics?.totalJobs ?? 0}</Typography>
        </Stack>
        <Stack flexDirection='row' alignItems='center' gap='.5rem'>
          <Typography>Processed jobs:</Typography>
          <Typography fontSize='1.2rem' sx={{ color: (theme) => theme.palette.warning.main }}>
            {statistics?.processedJobs ?? 0}
          </Typography>
        </Stack>
        <Stack flexDirection='row' alignItems='center' gap='.5rem'>
          <Typography>Failed Jobs:</Typography>
          <Typography color='error' fontSize='1.2rem'>
            {statistics?.failedJobs ?? 0}
          </Typography>
        </Stack>
      </Stack>
      <Box sx={{ width: '100%' }}>
        <LinearProgressWithLabel
          value={progress}
          color={isFinished ? 'success' : 'primary'}
          sx={{
            height: '1rem',
            borderRadius: '1rem',
          }}
        />
      </Box>
      <Button
        variant='outlined'
        size='large'
        type='submit'
        className={mdDown ? 'mobile' : ''}
        sx={{
          alignSelf: 'center',
          '&.mobile': {
            minWidth: '0',
          },
        }}
        onClick={isFinished ? handleHide : resetHandler}
      >
        {isFinished ? 'Close' : 'Reset'}
      </Button>
      {errors.length > 0 && (
        <List
          sx={{
            backgroundColor: (theme) => theme.palette.error.light,
            color: '#fff',
            padding: '1rem',
            borderRadius: '.5rem',
          }}
        >
          {errors.map((error, index) => (
            <ListItemText key={index}>{error}</ListItemText>
          ))}
        </List>
      )}
    </Stack>
  );
}
