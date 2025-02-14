'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomSingleSelect from '../../form/CustomSingleSelect/CustomSingleSelect';
import DateInput from '../../form/DateInput/DateInput';

type AccountUserFields = 'user_id' | 'start_date' | 'end_date';

interface IFormInputs {
  user_id: number | string;
  start_date: string | Dayjs | null;
  end_date: string | Dayjs | null;
}

interface IAccountUserActionsProps {
  id: number | null;
  visible: boolean;
  url: string;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function AccountUsersActions({
  id,
  commonData,
  url,
  visible,
  isDuplicate = false,
  handleActions,
}: IAccountUserActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );

  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const users = commonData.users ?? [];

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
      user_id: '',

      start_date: null,
      end_date: null,
    },
  });

  const clearData = () =>
    reset({
      user_id: '',

      start_date: null,
      end_date: null,
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
          queryKey: ['account-users'],
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
          queryKey: ['account-users'],
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
    queryKey: ['account-user', id ?? null],
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
      reset({
        user_id: data.user.id,
        start_date: data.start_date,
        end_date: data.end_date,
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
      title='Account User'
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
      isDuplicate={isDuplicate}
    >
      <Controller
        name='user_id'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <CustomSingleSelect
            label='User'
            link='/users'
            field={field}
            options={users}
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
            style={{
              minWidth: 'calc(50% - 1rem)',
              '&.mobile': {
                gridColumn: 'auto',
              },
            }}
            field={field}
            required
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
