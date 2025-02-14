'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { TextField, Theme, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import CustomSelect from '../../common/form/CustomSelect/CustomSelect';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import LinksDestinations from './LinksDestinations';
import { IFormInputs, ILinksActionsProps, LinksFields } from './types';

const getDefaultFormInputs = (): IFormInputs => ({
  name: '',
  url: '',
  tool_id: '',
  status_id: '',
  object_id: '',
  owner_id: '',
  inner_client_id: '',
  format_id: '',
  description: '',
  professions: [],
  destinations: [],
  reason: '',
});
const bookmarkErrorRelations = {
  profile: [
    'name',
    'url',
    'tool_id',
    'status_id',
    'object_id',
    'owner_id',
    'inner_client_id',
    'format_id',
    'description',
    'professions',
    'destinations',
    'reason',
  ],
  destinations: ['destinations'],
};

export default function LinksActions({
  id,
  commonData,
  visible,
  isProfile = false,
  isDuplicate = false,
  handleActions,
}: ILinksActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const {
    activeBookmark,
    changeActiveBookmark,
    toggleBookmarkError,
    getBookmarkErrorName,
    bookmarks,
  } = useBookmarks(['profile', 'destinations'], visible);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const editorDescriptionRef = useRef<IEditor | null>(null);

  const tools = commonData.tools ?? [];
  const formats = commonData.formats ?? [];
  const accounts = commonData.accounts ?? [];
  const inner_clients = commonData.inner_clients ?? [];
  const objects = commonData.objects ?? [];
  const statuses = commonData.statuses ?? [];
  const professions = commonData.professions ?? [];

  const {
    register,
    reset,
    control,
    getValues,
    setValue,
    watch,
    clearErrors,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: getDefaultFormInputs(),
  });

  const clearData = () => reset(getDefaultFormInputs());

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    handleActions(false);
    setCreationInfo(null);
    changeActiveBookmark('profile');
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as LinksFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
    const bookmarkErrorName = getBookmarkErrorName(bookmarkErrorRelations, Object.keys(errors));
    const [nextBookmark] = bookmarkErrorName;
    toggleBookmarkError(bookmarkErrorName);
    if (activeBookmark !== nextBookmark) {
      changeActiveBookmark(nextBookmark);
    }
  };

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => apiSetData('links', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'link' : 'links'],
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
    mutationFn: async (data: any) => apiUpdateData(`links/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'link' : 'links'],
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
    queryKey: ['link', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`links/${id}`);
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
        url: data?.url,
        description: data?.description,
        destinations: data?.destinations,
        tool_id: data?.tool.id,
        object_id: data?.object.object_id,
        inner_client_id: data?.inner_client.id,
        owner_id: data?.owner.id,
        format_id: data?.format.id,
        status_id: data?.status.id,
        professions: data.professions.map((el: any) => el.profession_id),
        reason: '',
      });
      setCreationInfo({
        created_at: data?.created_at,
        created_by: data?.created_by,
      });
    } else {
      setValue(
        'status_id',
        (statuses.find((status) => status.is_default === 1)?.id as number) ?? ''
      );
    }
  }, [data, visible, isDuplicate]);

  useEffect(() => {
    if (id && visible) {
      refetch();
    }
    if (!visible) {
      changeActiveBookmark('profile');
    }
  }, [id, visible]);

  return (
    <ActionsDrawer
      id={id}
      title='Link'
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
      {activeBookmark === 'profile' && (
        <>
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
            {...register('url')}
            error={!!errors.url}
            helperText={errors.url ? errors.url?.message : ''}
            label={<CustomLabel label={'URL'} required />}
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
            name='tool_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Tool'
                  link='/tools'
                  field={field}
                  required
                  options={tools}
                  error={error}
                  style={{
                    minWidth: 'calc(33.3% - 1rem)',
                  }}
                />
              );
            }}
          />
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
                  required
                  style={{
                    minWidth: 'calc(50% - 1rem)',
                    flexGrow: 1,
                  }}
                />
              );
            }}
          />
          <Controller
            name='object_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Object'
                  link='/objects'
                  field={field}
                  required
                  options={objects}
                  error={error}
                  style={{
                    minWidth: 'calc(50% - 1rem)',
                    flexGrow: 1,
                  }}
                />
              );
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
                  required
                  error={error}
                  style={{
                    minWidth: 'calc(33.3% - 1rem)',
                  }}
                />
              );
            }}
          />
          <Controller
            name='status_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Status'
                  link='/statuses'
                  field={field}
                  options={statuses}
                  required
                  error={error}
                  style={{
                    minWidth: 'calc(33.3% - 1rem)',
                  }}
                />
              );
            }}
          />
          <Controller
            name='format_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Formats'
                  link='/formats'
                  field={field}
                  options={formats}
                  required
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
            name='professions'
            render={({ field: { onChange, value, name }, fieldState: { error } }) => (
              <CustomSelect
                type={name}
                link='/professions'
                options={professions}
                required
                value={value}
                error={error!}
                handleChange={onChange}
                style={{
                  minWidth: 'calc(50% - .75rem)',
                }}
              />
            )}
          />
          <Controller
            control={control}
            name='description'
            render={({ field: { onChange, value, name }, fieldState: { error } }) => (
              <CustomTextEditor
                ref={editorDescriptionRef}
                value={value}
                fullScreen={fullScreen}
                height={fullScreen ? 500 : 150}
                onEditorChange={onChange}
                title={name}
                error={error?.message}
                style={{
                  display: activeBookmark === 'profile' ? 'flex' : 'none',
                  width: '100%',
                }}
              />
            )}
          />
        </>
      )}

      <LinksDestinations
        control={control}
        commonData={commonData}
        getValues={getValues}
        setValue={setValue}
        errors={errors}
        fullScreen={fullScreen}
        defaultLinksDestinations={data?.destinations}
        activeBookmark={activeBookmark}
      />
    </ActionsDrawer>
  );
}
