'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { Stack, TextField, Theme, useMediaQuery } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import DateInput from '../../common/form/DateInput/DateInput';

type ShiftsFields = 'name';

interface IFormInputs {
  name: string;
  start_time: Dayjs | null;
  end_time: Dayjs | null;
  reason: string;
}

interface IblockActionsProps {
  id: number | null;
  visible: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function ShiftsActions({
  id,
  visible,
  isDuplicate = false,
  handleActions,
}: IblockActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);

  const {
    register,
    reset,
    control,
    clearErrors,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      reason: '',
      name: '',
      start_time: dayjs().format('HH:mm'),
      end_time: dayjs().format('HH:mm'),
    },
  });

  const clearData = () =>
    reset({
      name: '',
      start_time: null,
      end_time: null,
      reason: '',
    });

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as ShiftsFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
    toggleBookmarkError('profile');
  };

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => apiSetData('shifts', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['shifts'],
        });
        hideHandler();
        showNotification('Successfully created', 'success');
        if (addLibrary) window.close();
      }
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      if (status === 422) {
        handleErrors(error, status);
      } else {
        showNotification(`${status}: Something went wrong`, 'error');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiUpdateData(`shifts/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['shifts'],
        });
        hideHandler();
        showNotification('Successfully updated', 'success');
        if (addLibrary) window.close();
      }
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      if (status === 422) {
        handleErrors(error, status);
      } else {
        showNotification(`${status}: Something went wrong`, 'error');
      }
    },
  });

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['shift', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`shifts/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
      start_time: dayjs(data.start_time).format('HH:mm'),
      end_time: dayjs(data.end_time).format('HH:mm'),
    };
    if (id && !isDuplicate) {
      updateMutation.mutate(commonData);
    } else {
      createMutation.mutate(commonData);
    }
  };

  const submitHandler = handleSubmit(onSubmit);

  const submitForm = (e: FormEvent) => {
    e.preventDefault();
    clearErrors();
    submitHandler();
  };

  useEffect(() => {
    if (data) {
      const [hoursStart, minutesStart] = data.start_time.split(':');
      const [hoursEnd, minutesEnd] = data.end_time.split(':');
      reset({
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        start_time: dayjs().set('hour', hoursStart).set('minute', minutesStart),
        end_time: dayjs().set('hour', hoursEnd).set('minute', minutesEnd),
        reason: '',
      });
      setCreationInfo({
        created_at: data.created_at,
        created_by: data.created_by,
      });
    }
  }, [data, visible, isDuplicate]);

  useEffect(() => {
    if (id && visible) {
      refetch();
    }
  }, [id, visible]);

  return (
    <ActionsDrawer
      id={id}
      title='Shift'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      hideHandler={hideHandler}
      resetHandler={clearData}
      submitForm={submitForm}
      changeActiveBookmark={changeActiveBookmark}
      toggleBookmarkError={toggleBookmarkError}
      fullScreenHandler={fullScreenHandler}
      isLoading={isFetching}
      fullScreen={fullScreen}
      register={register}
      errors={errors}
      isDuplicate={isDuplicate}
    >
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name ? errors.name?.message : ''}
        label={<CustomLabel label={'Shift name'} required />}
        className={mdDown ? 'mobile' : ''}
        sx={{
          minWidth: 'calc(33.3% - 1rem)',
          '&.mobile': {
            width: 'auto',
            flex: '1',
          },
        }}
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer
          components={['TimePicker', 'TimePicker']}
          sx={{ width: fullScreen ? 'calc(65% - 1rem)' : 'unset' }}
        >
          <Stack sx={{ width: '100%', flexDirection: fullScreen ? 'row' : 'column' }} gap='1.5rem'>
            <Controller
              control={control}
              name='start_time'
              render={({ field }) => (
                <DateInput
                  label={'Start Time'}
                  error={errors?.start_time as any}
                  required
                  style={{
                    minWidth: 'calc(50% - 1rem)',
                    '&.mobile': {
                      gridColumn: 'auto',
                    },
                  }}
                  field={field}
                  variant='time'
                />
              )}
            />
            <Controller
              control={control}
              name='end_time'
              render={({ field }) => (
                <DateInput
                  label={'End Time'}
                  error={errors?.end_time as any}
                  required
                  style={{
                    minWidth: 'calc(50% - 1rem)',
                    '&.mobile': {
                      gridColumn: 'auto',
                    },
                  }}
                  field={field}
                  variant='time'
                />
              )}
            />
          </Stack>
        </DemoContainer>
      </LocalizationProvider>
    </ActionsDrawer>
  );
}
