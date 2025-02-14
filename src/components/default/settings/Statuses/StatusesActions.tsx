'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import ColorInput from '@/components/default/common/form/ColorInput/ColorInput';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { TextField, Theme, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import CustomSelect from '../../common/form/CustomSelect/CustomSelect';

type StatusesFields = 'name' | 'color' | 'entity_block';
interface IFormInputs {
  name: string;
  color: string;
  entity_block: number[];
  reason: string;
}

interface IStatusesActionsProps {
  id: number | null;
  visible: boolean;
  isDuplicate?: boolean;
  commonData: ICommonData;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function StatusesActions({
  id,
  commonData,
  visible,
  isDuplicate = false,
  handleActions,
}: IStatusesActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );
  const statuses = commonData.statuses ?? [];
  const entity_block = commonData.entity_block ?? [];

  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);

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
      name: '',
      color: '',
      entity_block: [],
      reason: '',
    },
  });

  const clearData = () =>
    reset({
      name: '',
      color: '',
      entity_block: [],
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
      const errorKey = key as StatusesFields;
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
    mutationFn: (data: any) => apiSetData('statuses', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['statuses'],
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
    mutationFn: async (data: any) => apiUpdateData(`statuses/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['statuses'],
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
    queryKey: ['status', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`statuses/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    if (id && !isDuplicate) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
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
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        color: data?.color,
        entity_block: data?.entity_blocks?.map((el: any) => el.id),
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
      title='Status'
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
        label={<CustomLabel label={'Name'} required />}
        helperText={errors.name ? errors.name?.message : ''}
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
        control={control}
        name='entity_block'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            options={entity_block}
            value={value}
            required
            link='/entity-block-fields'
            error={error!}
            handleChange={onChange}
            style={{
              minWidth: 'calc(33.3% - 1rem)',
              maxWidth: 380,
            }}
          />
        )}
      />
      <Controller
        name='color'
        control={control}
        render={({ field }) => (
          <ColorInput field={field} error={errors.color} required label='Color' />
        )}
      />
    </ActionsDrawer>
  );
}
