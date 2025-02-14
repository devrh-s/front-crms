'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
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

type EntityFields = 'name' | 'table_name' | 'entity_type_id';

interface IFormInputs {
  name: string;
  table_name: string;
  entity_type_id: number | string;
  blocks: number[];
  reason: string;
}

interface IEntityActionsProps {
  id: number | null;
  visible: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function EntityActions({
  id,
  commonData,
  visible,
  isDuplicate = false,
  handleActions,
}: IEntityActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );
  const entity_types = commonData.entity_types ?? [];
  const blocks = commonData.blocks ?? [];
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
      table_name: '',
      entity_type_id: '',
      blocks: [],
      reason: '',
    },
  });

  const clearData = () =>
    reset({
      name: '',
      table_name: '',
      entity_type_id: '',
      blocks: [],
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
      const errorKey = key as EntityFields;
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
    mutationFn: (data: any) => apiSetData('entities', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['entities'],
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
    mutationFn: async (data: any) => apiUpdateData(`entities/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['entities'],
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
    queryKey: ['entity', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`entities/${id}`);
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
        table_name: data.table_name,
        entity_type_id: data?.entity_type?.id,
        blocks: data?.blocks.map((block: IBlock) => block.id),
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
      title='Entity'
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
        disabled={!!id}
      />
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('table_name')}
        error={!!errors.table_name}
        label={<CustomLabel label={'Table name'} required />}
        helperText={errors.table_name ? errors.table_name?.message : ''}
        className={mdDown ? 'mobile' : ''}
        sx={{
          minWidth: 'calc(33.3% - 1rem)',
          '&.mobile': {
            width: 'auto',
            flex: '1',
          },
        }}
        disabled={!!id}
      />

      <Controller
        name='entity_type_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Entity Type'
              link='/entity-types'
              field={field}
              options={entity_types}
              error={error}
              required
              style={{
                minWidth: 'calc(33.3% - 1rem)',
                maxWidth: 380,
                flexGrow: 1,
              }}
            />
          );
        }}
      />

      <Controller
        control={control}
        name='blocks'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/blocks'
            options={blocks}
            value={value}
            required
            error={error!}
            handleChange={onChange}
            style={{
              minWidth: 'calc(33.3% - 1rem)',
              maxWidth: 380,
            }}
          />
        )}
      />
    </ActionsDrawer>
  );
}
