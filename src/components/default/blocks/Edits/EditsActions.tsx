'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import useBookmarks, { BookmarkName } from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { Stack, TextField, Theme, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import MultiInputGroup from '../../common/form/MultiInputGroup/MultiInputGroup';
import ProgressInputs from '../../common/form/ProgressInputs/ProgressInputs';

type ContactsFields = 'name' | 'description';

interface IProgressInput {
  id?: number;
  status?: {
    id: number;
  };
  type?: string;
  done?: number;
}

interface IFormInputs {
  id: number | string;
  name: string;
  description: string;
  block_id: number | string;
  reason: string;
  edit_progress: IProgressInput[];
}

interface IContactsActionsProps {
  id: number | null;
  url?: string;
  visible: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

const bookmarkErrorRelations: { [key in BookmarkName]?: string[] } = {
  profile: ['name'],
  progress: ['edit_progress'],
};

export default function EditsActions({
  id,
  url,
  commonData,
  visible,
  isDuplicate = false,
  handleActions,
}: IContactsActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const {
    activeBookmark,
    changeActiveBookmark,
    toggleBookmarkError,
    getBookmarkErrorName,
    toggleInteraction,
    bookmarks,
  } = useBookmarks(['progress', 'profile'], visible);
  const statuses = commonData.statuses ?? [];
  const types = commonData.types ?? [];
  const editorRef = useRef<IEditor | null>(null);
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const {
    register,
    reset,
    control,
    setError,
    getValues,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      id: '',
      name: '',
      description: '',
      block_id: '',
      reason: '',
      edit_progress: [],
    },
  });

  const clearData = () =>
    reset({
      id: '',
      name: '',
      description: '',
      block_id: '',
      reason: '',
    });

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    toggleBookmarkError();
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as ContactsFields;
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
    mutationFn: (data: any) => apiSetData(url ?? 'edits', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [url ?? 'edits'],
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
    mutationFn: async (data: any) => apiUpdateData(`edits/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [url ?? 'edits'],
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
    queryKey: [`edits/${id}`],
    queryFn: async () => {
      const response = await apiGetData(`edits/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      name: data?.name,
      reason: data?.reason,
      description: data?.description,
      edit_progress: data?.edit_progress.map((prog) => ({
        id: prog?.id,
        status_id: prog?.status?.id,
        type: prog?.type,
        done: prog?.done,
      })),
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
      toggleInteraction();
      reset({
        id: data?.id,
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        description: data?.description,
        block_id: data.block?.id,
        edit_progress: data?.edit_progress,
      });
      setCreationInfo({
        created_at: data.created_at,
        created_by: data.createdBy,
      });
      if (isDuplicate) {
        toggleInteraction('progress');
      }
    } else {
      toggleInteraction('progress');
    }
  }, [data, visible, isDuplicate]);

  useEffect(() => {
    if (id && visible && !url) {
      refetch();
    }
  }, [id, visible]);
  // TODO: контакты не обновляются с вкладки контакты
  return (
    <ActionsDrawer
      id={id}
      title='Edit'
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
      <Stack sx={{ display: activeBookmark === 'profile' ? 'flex' : 'none' }} gap='1rem'>
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
                display: activeBookmark === 'profile' ? 'flex' : 'none',
                width: '100%',
              }}
            />
          )}
        />
      </Stack>

      <Stack sx={{ display: activeBookmark === 'progress' ? 'flex' : 'none' }} gap='1rem'>
        <MultiInputGroup
          control={control}
          name={'edit_progress'}
          hiddenAddButton
          error={errors.edit_progress}
          onDeleteClick={(index) => {
            const oldValues = getValues('edit_progress');
            setValue(
              'edit_progress',
              oldValues.filter((_, ind) => ind !== index)
            );
          }}
          label={'Progress'}
          fullScreen={fullScreen}
          renderInputs={({ index }) => (
            <ProgressInputs
              control={control}
              types={types}
              statuses={statuses}
              errors={errors.edit_progress}
              index={index}
            />
          )}
        />
      </Stack>
    </ActionsDrawer>
  );
}
