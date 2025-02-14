'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
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
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';

type GPTsFields = 'name' | 'link' | 'type' | 'entities' | 'tools';

interface IFormInputs {
  name: string;
  link: string;
  type: string;
  owner_id: number | string;
  custom_instructions_link: string;
  entities: number[];
  tools: number[];
  task_templates: number[];
  links: number[];
  reason: string;
}

interface IGPTsActionsProps {
  id: number | null;
  visible: boolean;
  url?: string;
  isProfile?: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function GPTsActions({
  id,
  url,
  commonData,
  isProfile = false,
  isDuplicate = false,
  visible,
  handleActions,
}: IGPTsActionsProps) {
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
      link: '',
      type: '',
      owner_id: '',
      custom_instructions_link: '',
      entities: [],
      tools: [],
      task_templates: [],
      links: [],
      reason: '',
    },
  });

  const clearData = () =>
    reset({
      name: '',
      link: '',
      type: '',
      owner_id: '',
      custom_instructions_link: '',
      entities: [],
      tools: [],
      task_templates: [],
      links: [],
      reason: '',
    });

  const tools = commonData.tools ?? [];
  const task_templates = commonData.task_templates ?? [];
  const entities = commonData.entities ?? [];
  const links = commonData.links ?? [];
  const accounts = commonData.accounts ?? [];
  const types = commonData.types ?? [];

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
      const errorKey = key as GPTsFields;
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
    mutationFn: (data: any) => apiSetData(url ?? 'gpts', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'gpt' : (url ?? 'gpts')],
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
    mutationFn: async (data: any) => apiUpdateData(url ? `${url}/${id}` : `gpts/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'gpt' : (url ?? 'gpts')],
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
    queryKey: ['gpt', id],
    queryFn: async () => {
      const response = await apiGetData(url ? `${url}/${id}` : `gpts/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
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
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        link: data?.link,
        type: data?.type,
        owner_id: data?.owner_id,
        custom_instructions_link: data?.custom_instructions_link,
        entities: data?.entities?.map((el: any) => el.id),
        tools: data?.tools?.map((el: any) => el.id),
        task_templates: data?.task_templates?.map((el: any) => el.id),
        links: data?.links?.map((el: any) => el.id),
        reason: '',
      });
      setCreationInfo({
        created_at: data?.created_at,
        created_by: data?.createdBy,
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
      title='GPT'
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
        {...register('link')}
        error={!!errors.link}
        helperText={errors.link ? errors.link?.message : ''}
        label={<CustomLabel label={'Link'} required />}
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
        name='type'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Type'
              link='/types'
              required
              field={field}
              options={types}
              error={error}
              style={{
                minWidth: 'calc(33.3% - 1rem)',
              }}
            />
          );
        }}
      />

      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('custom_instructions_link')}
        error={!!errors.custom_instructions_link}
        helperText={errors.custom_instructions_link ? errors.custom_instructions_link?.message : ''}
        label='Custom instructions link'
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
        name='owner_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Owner'
              link='/accounts'
              field={field}
              options={accounts}
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
        name='entities'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/entities'
            required
            options={entities}
            value={value}
            error={error!}
            handleChange={onChange}
            style={{
              minWidth: 'calc(33.3% - 1rem)',
            }}
          />
        )}
      />
      <Controller
        control={control}
        name='tools'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/tools'
            required
            options={tools}
            value={value}
            error={error!}
            handleChange={onChange}
            style={{
              minWidth: 'calc(33.3% - 1rem)',
            }}
          />
        )}
      />
      <Controller
        control={control}
        name='task_templates'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/task-templates'
            options={task_templates}
            value={value}
            error={error!}
            handleChange={onChange}
            style={{
              minWidth: 'calc(33.3% - 1rem)',
            }}
          />
        )}
      />
      <Controller
        control={control}
        name='links'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/links'
            options={links}
            value={value}
            error={error!}
            handleChange={onChange}
            style={{
              minWidth: 'calc(33.3% - 1rem)',
            }}
          />
        )}
      />
    </ActionsDrawer>
  );
}
