'use client';
import AddImage from '@/components/default/common/components/Addimage';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { TextField, Theme, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import { getActiveBookmark, getDisabledBookmark } from '../helpers/bookmarks';

type IACtionsFields =
  | 'name'
  | 'status_id'
  | 'library_id'
  | 'translation_id'
  | 'priority_id'
  | 'description';

interface IFormInputs {
  name: string;
  status_id: number;
  library_id?: number | string;
  translation_id: number | string;
  priority_id: number;
  description: string;
  image_icon: any;
  reason: string;
}

interface IActionsActionsProps {
  id: number | null;
  visible: boolean;
  commonData: ICommonData;
  isProfile?: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function ActionsActions({
  id,
  commonData,
  visible,
  isProfile = false,
  isDuplicate = false,
  handleActions,
}: IActionsActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const editorRef = useRef<IEditor | null>(null);
  const {
    activeBookmark,
    changeActiveBookmark,
    toggleInteraction,
    toggleBookmarkError,
    bookmarks,
  } = useBookmarks(['group', 'translation', 'similar'], visible);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const statuses = commonData.statuses ?? [];
  const languages = commonData.languages ?? [];
  const priorities = commonData.priorities ?? [];
  const libraries = commonData.groups ?? [];
  const libraries_similar = commonData.groups_similar ?? [];
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);

  const filteredLanguages = useMemo(() => {
    if (activeBookmark === 'translation') {
      return languages.filter((el) => el.id !== 1);
    }
    return languages;
  }, [languages, activeBookmark]);

  const {
    register,
    reset,
    control,
    getValues,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      status_id: 1,
      library_id: '',
      priority_id: 1,
      translation_id: 1,
      description: '',
      image_icon: '',
      reason: '',
    },
  });

  const clearData = () =>
    reset({
      name: '',
      status_id: 1,
      translation_id: 1,
      library_id: '',
      priority_id: 1,
      description: '',
      image_icon: '',
      reason: '',
    });

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    changeActiveBookmark('group');
    queryClient.removeQueries({ queryKey: ['action-actions'] });
    toggleInteraction();
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as IACtionsFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
    toggleBookmarkError(activeBookmark);
  };

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => apiSetData('actions', data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'action' : 'actions'],
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
    mutationFn: async (data: any) => apiUpdateData(`actions/${id}`, data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'action' : 'actions'],
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
    queryKey: ['action-actions', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`actions/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
    };
    if (typeof commonData.image_icon === 'string') {
      delete commonData.image_icon;
    }
    if (activeBookmark === 'group') {
      delete commonData.library_id;
    }
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
      const priorityName = data.priority.name;
      const translationISO = data.translation.iso2;
      const newActiveBookmark = getActiveBookmark(priorityName, translationISO);
      const disabledBookmark = getDisabledBookmark(newActiveBookmark);
      reset({
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        status_id: data.status.id,
        priority_id: data.priority.id,
        library_id: data.library.id,
        translation_id: data.translation.id,
        image_icon: isDuplicate ? '' : data?.image_icon,
        description: data.description,
        reason: '',
      });
      setCreationInfo({
        created_at: data.created_at,
        created_by: data.created_by,
      });
      changeActiveBookmark(newActiveBookmark);
      toggleInteraction(disabledBookmark);
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
  }, [id, visible]);

  useEffect(() => {
    if (!id) {
      if (activeBookmark === 'group') {
        clearData();
      }
      if (activeBookmark === 'translation') {
        setValue('translation_id', '');
      }
      if (activeBookmark === 'similar') {
        setValue('priority_id', 2);
        setValue('translation_id', 1);
      }
    }
  }, [id, activeBookmark]);

  return (
    <ActionsDrawer
      id={id}
      title='Action'
      visible={visible}
      isLoading={!!id && isFetching}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      hideHandler={hideHandler}
      submitForm={submitForm}
      changeActiveBookmark={changeActiveBookmark}
      toggleBookmarkError={toggleBookmarkError}
      fullScreenHandler={fullScreenHandler}
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
        name='status_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Status'
              link='/statuses'
              field={field}
              required
              options={statuses}
              error={error}
              style={{
                minWidth: 'calc(33.3% - 1rem)',
              }}
            />
          );
        }}
      />

      {activeBookmark !== 'group' && (
        <Controller
          name='library_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Group'
                link='/actions'
                field={field}
                options={activeBookmark === 'translation' ? libraries_similar : libraries}
                required={activeBookmark !== 'group'}
                error={error}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                }}
              />
            );
          }}
        />
      )}

      <Controller
        name='translation_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Translation'
              link='/languages'
              disabled={activeBookmark !== 'translation'}
              field={field}
              required={activeBookmark === 'translation'}
              options={filteredLanguages}
              error={error}
              style={{
                minWidth: 'calc(33.3% - 1rem)',
              }}
            />
          );
        }}
      />

      <Controller
        name='priority_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Priority'
              link='/priorities'
              disabled={activeBookmark !== 'translation'}
              required
              field={field}
              options={priorities}
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
        name='description'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomTextEditor
            ref={editorRef}
            value={value}
            fullScreen={fullScreen}
            height={fullScreen ? 500 : 150}
            onEditorChange={onChange}
            title={name}
            error={error?.message}
            style={{
              width: '100%',
            }}
          />
        )}
      />

      <Controller
        control={control}
        name='image_icon'
        render={({ field: { onChange, value } }) => (
          <AddImage value={value} text={value ? 'Update image' : 'Add image'} onChange={onChange} />
        )}
      />
    </ActionsDrawer>
  );
}
