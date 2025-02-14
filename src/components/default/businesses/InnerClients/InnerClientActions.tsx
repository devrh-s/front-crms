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
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';

type InnerClientFields =
  | 'name'
  | 'website'
  | 'iso'
  | 'description'
  | 'company_type_id'
  | 'tax_number';

interface IFormInputs {
  name: string;
  website: string;
  iso: string;
  description: string;
  tax_number: string;
  company_type_id: number | string;
  reason: string;
}

interface IInnerClinetActionsProps {
  id: number | null;
  visible: boolean;
  isProfile?: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function InnerClientActions({
  id,
  isProfile = false,
  isDuplicate = false,
  commonData,
  visible,
  handleActions,
}: IInnerClinetActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const company_types = commonData.company_types ?? [];
  const editorDescriptionRef = useRef<IEditor | null>(null);
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);

  const {
    register,
    reset,
    control,
    setError,
    handleSubmit,
    clearErrors,
    formState: { errors },
    getValues,
  } = useForm<IFormInputs>();

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const clearData = () =>
    reset({
      name: '',
      website: '',
      iso: '',
      description: '',
      tax_number: '',
      company_type_id: '',
      reason: '',
    });

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as InnerClientFields;
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
    mutationFn: (data: any) => apiSetData('inner-clients', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'inner-client' : 'inner-clients'],
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
    mutationFn: async (data: any) => apiUpdateData(`inner-clients/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'inner-client' : 'inner-clients'],
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
    queryKey: ['inner-client', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`inner-clients/${id}`);
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
        website: data.website,
        iso: data.iso,
        description: data.description,
        tax_number: data.tax_number,
        company_type_id: data?.company_type?.id,
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
      title='Inner Client'
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
      register={register}
      isLoading={isFetching}
      errors={errors}
      isDuplicate={isDuplicate}
    >
      <TextField
        className={mdDown ? 'mobile' : ''}
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('name')}
        error={!!errors.name}
        label={<CustomLabel label={'Name'} required />}
        helperText={errors.name ? errors.name?.message : ''}
        sx={{ minWidth: 'calc(50% - 1rem)' }}
      />
      <TextField
        className={mdDown ? 'mobile' : ''}
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('website')}
        label={<CustomLabel label={'Website'} required />}
        error={!!errors.website}
        helperText={errors.website ? errors.website?.message : ''}
        sx={{ minWidth: 'calc(50% - 1rem)' }}
      />
      <TextField
        className={mdDown ? 'mobile' : ''}
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('iso')}
        label={<CustomLabel label={'ISO'} required />}
        error={!!errors.iso}
        helperText={errors.iso ? errors.iso?.message : ''}
        sx={{ minWidth: 'calc(33.3% - 1rem)' }}
      />
      <TextField
        className={mdDown ? 'mobile' : ''}
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('tax_number')}
        label={<CustomLabel label={'Tax number'} required />}
        error={!!errors.tax_number}
        helperText={errors.tax_number ? errors.tax_number?.message : ''}
        sx={{ minWidth: 'calc(33.3% - 1rem)' }}
      />

      <Controller
        name='company_type_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Company type'
              link='/company-types'
              field={field}
              options={company_types}
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
    </ActionsDrawer>
  );
}
