'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomSelect from '@/components/default/common/form/CustomSelect/CustomSelect';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { TextField, Theme, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';

type MessagesFields =
  | 'name'
  | 'text'
  | 'inner_client_id'
  | 'short_code'
  | 'message_type_id'
  | 'reason'
  | 'translation_id';

interface IFormInputs {
  name: string;
  inner_client_id: number | string;
  text: string;
  short_code: string;
  message_type_id: number | string;
  reason: string;
  tools: number[];
  entity_block: number[];
  translation_id: number | string;
}

interface IMessagesActionsProps {
  id: number | null;
  visible: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function MessagesActions({
  id,
  commonData,
  visible,
  isDuplicate = false,
  handleActions,
}: IMessagesActionsProps) {
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
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      name: '',
      text: '',
      inner_client_id: '',
      message_type_id: '',
      short_code: '',
      reason: '',
      tools: [],
      entity_block: [],
      translation_id: '',
    },
  });

  const clearData = () =>
    reset({
      name: '',
      text: '',
      inner_client_id: '',
      message_type_id: '',
      short_code: '',
      reason: '',
      tools: [],
      entity_block: [],
      translation_id: '',
    });

  const inner_clients = commonData?.inner_clients ?? [];
  const message_types = commonData?.message_types ?? [];
  const tools = commonData?.tools ?? [];
  const entity_block = commonData.entity_block ?? [];
  const languages = commonData.languages ?? [];

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
      const errorKey = key as MessagesFields;
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
    mutationFn: (data: any) => apiSetData('messages', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['messages'],
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
    mutationFn: async (data: any) => apiUpdateData(`messages/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['messages'],
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
    queryKey: ['message', id],
    queryFn: async () => {
      const response = await apiGetData(`messages/${id}`);
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
        text: data.text,
        short_code: data.short_code,
        inner_client_id: data.inner_client.id,
        message_type_id: data.message_type.id,
        tools: data.tools.map((tool: any) => tool.id),
        entity_block: data.entity_blocks.map((block: any) => block.id),
        translation_id: data.translation?.id,
        reason: '',
      });
      setCreationInfo({
        created_at: data.created_at,
        created_by: data.createdBy,
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
      title='Message'
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
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name ? errors.name?.message : ''}
        label={<CustomLabel label={'Name'} required />}
        className={mdDown ? 'mobile' : ''}
        sx={{
          minWidth: 'calc(33.3% - 1rem)',
          '&.mobile': {
            width: 'auto',
            flex: '1',
          },
        }}
      />

      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('text')}
        error={!!errors.text}
        helperText={errors.text ? errors.text?.message : ''}
        className={mdDown ? 'mobile' : ''}
        label={<CustomLabel label={'Text'} required />}
        sx={{
          minWidth: 'calc(33.3% - 1rem)',
          '&.mobile': {
            width: 'auto',
            flex: '1',
          },
        }}
      />
      {/*<TextField*/}
      {/*  variant='standard'*/}
      {/*  InputLabelProps={{ shrink: true }}*/}
      {/*  {...register('short_code')}*/}
      {/*  error={!!errors.short_code}*/}
      {/*  label={<CustomLabel label={'Short code'} required />}*/}
      {/*  helperText={errors.short_code ? errors.short_code?.message : ''}*/}
      {/*  className={mdDown ? 'mobile' : ''}*/}
      {/*  sx={{*/}
      {/*    minWidth: 'calc(33.3% - 1rem)',*/}
      {/*    '&.mobile': {*/}
      {/*      width: 'auto',*/}
      {/*      flex: '1',*/}
      {/*    },*/}
      {/*  }}*/}
      {/*/>*/}

      <Controller
        name='inner_client_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Inner client'
              link='/inner-clients'
              field={field}
              options={inner_clients}
              error={error}
              style={{
                minWidth: 'calc(33.3% - 1rem)',
              }}
            />
          );
        }}
      />

      <Controller
        name='message_type_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Message type'
              link='/message-types'
              field={field}
              required
              options={message_types}
              error={error}
              style={{
                minWidth: 'calc(33.3% - 1rem)',
              }}
            />
          );
        }}
      />

      <Controller
        control={control}
        name='tools'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/tools'
            options={tools}
            value={value}
            error={error!}
            required
            handleChange={onChange}
            style={{
              display: activeBookmark === 'profile' ? 'flex' : 'none',
              flexGrow: 1,
              minWidth: 'calc(50% - 1.5rem)',
            }}
          />
        )}
      />

      <Controller
        control={control}
        name='entity_block'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/entity-block-fields'
            options={entity_block}
            value={value}
            error={error!}
            handleChange={onChange}
            required
            style={{ minWidth: 'calc(33.3% - 1rem)', maxWidth: 380 }}
          />
        )}
      />

      <Controller
        name='translation_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Translation'
              link='/languages'
              field={field}
              required
              options={languages}
              error={error}
              style={{
                minWidth: 'calc(33.3% - 1rem)',
              }}
            />
          );
        }}
      />
    </ActionsDrawer>
  );
}
