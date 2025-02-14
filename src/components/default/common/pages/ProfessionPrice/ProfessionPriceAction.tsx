'use client';
import { useSearchParams } from 'next/navigation';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { TextField, Theme, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { FormEvent, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../form/CustomLabel/CustomLabel';
import CustomSingleSelect from '../../form/CustomSingleSelect/CustomSingleSelect';
import DateInput from '../../form/DateInput/DateInput';

type AccountUserFields = 'rate_id' | 'start_date' | 'end_date' | 'value' | 'currency_id';

interface IFormInputs {
  rate_id: number | string;
  value: number | string;
  currency_id: number | string;
  start_date: string | Dayjs | null;
  end_date: string | Dayjs | null;
}

interface IProfessionPriceActionsProps {
  id: number | null;
  visible: boolean;
  url: string;
  commonData: ICommonData;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function ProfessionsPriceActions({
  id,
  commonData,
  url,
  visible,
  handleActions,
}: IProfessionPriceActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const rates = commonData.rates ?? [];
  const currencies = commonData.currencies ?? [];

  const {
    register,
    reset,
    control,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      rate_id: '',
      value: '',
      currency_id: '',
      start_date: null,
      end_date: null,
    },
  });

  const clearData = () =>
    reset({
      rate_id: '',
      value: '',
      currency_id: '',
      start_date: null,
      end_date: null,
    });

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose) {
      clearData();
    }
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as AccountUserFields;
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
    mutationFn: (data: any) => apiSetData(url, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['professions/price'],
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
    mutationFn: async (data: any) => apiUpdateData(`${url}/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['professions/price'],
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
    queryKey: ['profession-price', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`${url}/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
      start_date: data?.start_date ? dayjs(data.start_date).format('DD-MM-YYYY') : null,
      end_date: data?.end_date ? dayjs(data.end_date).format('DD-MM-YYYY') : null,
    };
    if (id) {
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
      reset({
        rate_id: data.rate.id,
        start_date: data.start_date,
        end_date: data.end_date,
        value: data.value,
        currency_id: data.currency.id,
      });
      setCreationInfo({
        created_at: data.created_at,
        created_by: data.created_by,
      });
    }
  }, [data, visible]);

  useEffect(() => {
    if (id && visible) {
      refetch();
    }
  }, [id, visible]);

  return (
    <ActionsDrawer
      id={id}
      title='Profession Price'
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
      fullScreen={fullScreen}
      isLoading={isFetching}
      register={register}
      errors={errors}
    >
      <TextField
        variant='standard'
        type='number'
        inputProps={{ min: 0 }}
        InputLabelProps={{ shrink: true }}
        {...register('value')}
        error={!!errors.value}
        label={<CustomLabel label={'Value'} required />}
        helperText={errors.value ? errors.value?.message : ''}
        className={mdDown ? 'mobile' : ''}
        sx={{
          minWidth: 'calc(33.3% - 1rem)',
          '&.mobile': {
            width: 'auto',
            flex: '1',
          },
        }}
      />
      <Controller
        name='currency_id'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <CustomSingleSelect
            label='Currency'
            link='/currencies'
            field={field}
            options={currencies}
            error={error}
            required
          />
        )}
      />
      <Controller
        name='rate_id'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <CustomSingleSelect
            link='/rates'
            label='Rate'
            field={field}
            options={rates}
            error={error}
            required
          />
        )}
      />

      <Controller
        name='start_date'
        control={control}
        render={({ field }) => (
          <DateInput
            label={'Start date'}
            format='DD-MM-YYYY'
            error={errors?.start_date}
            required
            style={{
              minWidth: 'calc(50% - 1rem)',
              '&.mobile': {
                gridColumn: 'auto',
              },
            }}
            field={field}
          />
        )}
      />

      <Controller
        name='end_date'
        control={control}
        render={({ field }) => (
          <DateInput
            label={'End Date'}
            format='DD-MM-YYYY'
            error={errors?.end_date}
            style={{
              minWidth: 'calc(50% - 1rem)',
              '&.mobile': {
                gridColumn: 'auto',
              },
            }}
            field={field}
          />
        )}
      />
    </ActionsDrawer>
  );
}
