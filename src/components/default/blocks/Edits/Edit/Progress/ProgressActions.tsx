'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import { IEditor } from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import useBookmarks, { BookmarkName } from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiUpdateData } from '@/lib/fetch';
import { Theme, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

type ContactsFields = 'status_id' | 'type' | 'reason';

interface IFormInputs {
  edit_id?: number;
  status_id?: number;
  type?: string;
  reason?: string;
}

interface IContactsActionsProps {
  id: number | null;
  profile_id: number;
  url?: string;
  visible: boolean;
  commonData: ICommonData;
  handleActions: (visible: boolean, id?: number | null) => void;
}

const bookmarkErrorRelations: { [key in BookmarkName]?: string[] } = {
  profile: ['name'],
  progress: ['edit_progress'],
};

export default function ProgressActions({
  id,
  profile_id,
  commonData,
  visible,
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
  } = useBookmarks(['profile'], visible);
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
      edit_id: 0,
    },
  });

  const clearData = () =>
    reset({
      edit_id: 0,
      status_id: 0,
      type: '',
      reason: '',
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
      const errorKey = key as ContactsFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues}`, 'error');
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

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiUpdateData(`edit-progress/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [`edits/${profile_id}`],
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
    queryKey: [`edit-progress/${id}`],
    queryFn: async () => {
      const response = await apiGetData(`edit-progress/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      edit_id: profile_id,
      ...data,
    };
    if (id) {
      updateMutation.mutate(commonData);
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
        status_id: data?.status?.id,
        type: data?.type,
      });
      setCreationInfo({
        created_at: data.created_at,
        created_by: data.createdBy,
      });
    } else {
      toggleInteraction('progress');
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
      title='Progress'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      hideHandler={hideHandler}
      submitForm={submitForm}
      resetHandler={clearData}
      changeActiveBookmark={changeActiveBookmark}
      toggleBookmarkError={toggleBookmarkError}
      fullScreenHandler={fullScreenHandler}
      fullScreen={fullScreen}
      isLoading={isFetching}
      register={register}
      errors={errors}
    >
      <Controller
        name={`status_id`}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <CustomSingleSelect
            label='Status'
            field={field}
            required
            options={statuses}
            error={errors && errors.status_id}
          />
        )}
      />
      <Controller
        name={`type`}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <CustomSingleSelect label='Types' field={field} required options={types} error={error} />
        )}
      />
    </ActionsDrawer>
  );
}
