import { FormEvent } from 'react';
import { Button, Stack, FormControlLabel, Switch, useMediaQuery, Theme } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import DownloadArea from '../form/DownloadArea/DownloadArea';
import { IImportState, IImportData } from './types';
import { apiSetData } from '@/lib/fetch';
import StartIcon from '@mui/icons-material/Start';
import { useMutation } from '@tanstack/react-query';
import useNotification from '@/hooks/useNotification';

interface IFormInputs {
  import_file: any;
  has_heading: boolean;
}

interface IIimportDOwnloadProps {
  state: IImportState;
  importUrl?: string;
  setLoading: (isLoaded: boolean) => void;
  setImportData: (data: IImportData) => void;
  setImportError: (error: string) => void;
}

export default function ImportDownload({
  state,
  importUrl,
  setLoading,
  setImportData,
  setImportError,
}: IIimportDOwnloadProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { control, watch, handleSubmit } = useForm<IFormInputs>({
    defaultValues: {
      has_heading: false,
    },
  });
  const watcherFile = watch('import_file');

  // const submitHandler = handleSubmit(async (data) => {
  //   setLoading(true);

  //   const result = await apiSetData(
  //     `${importUrl}/import`,
  //     { ...data, has_heading: data?.has_heading ? 1 : 0 },
  //     true
  //   );
  //   setLoading(false);
  //   if (!result.success) {
  //     const [error] = result?.data?.import_file;
  //     setImportError(error);
  //   } else {
  //     setImportData(result);
  //   }
  // });
  const showNotification = useNotification();
  const createMutation = useMutation({
    mutationFn: (data: any) =>
      apiSetData(`${importUrl}/import`, { ...data, has_heading: data?.has_heading ? 1 : 0 }, true),

    onSuccess: (result) => {
      if (result.success) {
        setImportData(result);
      }
      setLoading(false);
    },
    onError: (responseError: ResponseError) => {
      setLoading(false);
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      setImportError(error?.import_file);
      showNotification(`${status}: ${error?.import_file}`, 'error');
    },
  });
  const submitHandler = handleSubmit((data) => {
    setLoading(true);
    createMutation.mutate(data);
  });

  const submitForm = (e: FormEvent) => {
    e.preventDefault();
    submitHandler();
  };

  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} onSubmit={submitForm}>
      <Controller
        control={control}
        name='import_file'
        render={({ field: { onChange, value } }) => (
          <DownloadArea value={value} error={state?.error} onChange={onChange} />
        )}
      />
      <Stack flexDirection='row' justifyContent='space-between'>
        <Controller
          control={control}
          name='has_heading'
          render={({ field: { onChange, value } }) => (
            <FormControlLabel
              value={value}
              control={<Switch />}
              onChange={onChange}
              label='File Contains Headings Row'
            />
          )}
        />
        <Button
          disabled={watcherFile === undefined}
          variant='contained'
          type='submit'
          className={mdDown ? 'mobile' : ''}
          sx={{
            padding: '.5rem 3rem',
            '&.mobile': {
              minWidth: '0',
            },
          }}
          endIcon={<StartIcon />}
        >
          Next
        </Button>
      </Stack>
    </form>
  );
}
