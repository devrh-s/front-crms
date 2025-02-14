'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomLabel from '@/components/default/common/form/CustomLabel/CustomLabel';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import FormatObject from '@/components/default/common/related/actions/FormatObject/FormatObject';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { TextField, Theme, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

type ObjectsFields = 'link' | 'object_id' | 'format_id' | 'description';
interface IFormInputs {
  link: string;
  description: string;
  object_id: number | string;
  format_id: number | string;
  reason: string;
}

interface IObjectsActionsProps {
  id: number | null;
  url: string;
  visible: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function GuideFormatsActions({
  id,
  commonData,
  visible,
  isDuplicate = false,
  handleActions,
  url,
}: IObjectsActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const objects = commonData.objects ?? [];
  const formats = commonData.formats ?? [];
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const editorRef = useRef<IEditor | null>(null);

  const {
    register,
    reset,
    control,
    watch,
    setValue,
    clearErrors,
    setError,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      link: '',
      description: '',
      format_id: '',
      object_id: '',
      reason: '',
    },
  });

  const clearData = () =>
    reset({
      link: '',
      description: '',
      format_id: '',
      object_id: '',
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
      const errorKey = key as ObjectsFields;
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
          queryKey: ['guide-formats'],
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
          queryKey: ['guide-formats'],
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
    queryKey: ['guide-format', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`${url}/${id}`);
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
        link: data.link,
        object_id: data.object.object_id,
        format_id: data.format.id,
        description: data.description,
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
      title='Guide Format'
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
        {...register('link')}
        error={!!errors.link}
        helperText={errors.link ? errors.link?.message : ''}
        label={<CustomLabel label={'Link'} />}
        className={mdDown ? 'mobile' : ''}
        sx={{
          minWidth: 'calc(50% - 1rem)',
          '&.mobile': {
            width: 'auto',
            flex: '1',
          },
        }}
      />

      <FormatObject
        watch={watch}
        formats={formats}
        objects={objects}
        control={control}
        objectName='object_id'
        formatName='format_id'
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
    </ActionsDrawer>
  );
}
