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

type ChecklistItemsFields = 'name' | 'guides' | 'placement_id';
interface IFormInputs {
  name: string;
  guides: number[] | [];
  action_id: string;
  object_id: string;
  tool_id: string;
  placement_id: number | string;
  reason: string;
}

interface IChecklistItemsActionsProps {
  id: number | null;
  visible: boolean;
  commonData: ICommonData;
  isProfile?: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function ChecklistItemsActions({
  id,
  commonData,
  isProfile = false,
  isDuplicate = false,
  visible,
  handleActions,
}: IChecklistItemsActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const objects = commonData.objects ?? [];
  const tools = commonData.tools ?? [];
  const actions = commonData.actions ?? [];
  const placements = commonData?.placements || [];

  const {
    register,
    reset,
    getValues,
    clearErrors,
    control,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      name: '',
      action_id: '',
      object_id: '',
      tool_id: '',
      guides: [],
      reason: '',
    },
  });

  const clearData = () =>
    reset({
      name: '',
      action_id: '',
      object_id: '',
      tool_id: '',
      guides: [],
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
      const errorKey = key as ChecklistItemsFields;
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
    mutationFn: (data: any) => apiSetData('checklist-items', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'checklist-item' : 'checklist-items'],
        });
        hideHandler();
        showNotification('Successfully created', 'success');
        setIsDraft(false);
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
    mutationFn: async (data: any) => apiUpdateData(`checklist-items/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'checklist-item' : 'checklist-items'],
        });
        hideHandler();
        showNotification('Successfully updated', 'success');
        setIsDraft(false);
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
    queryKey: ['checklist-item', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`checklist-items/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
      is_draft: isDraft,
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
        guides: data.guides.map((el: any) => el.id),
        placement_id: data?.placement?.id ?? '',
        tool_id: data?.tool?.id ?? '',
        object_id: data?.object?.object_id ?? '',
        action_id: data?.action?.action_id ?? '',
        reason: '',
      });
      setCreationInfo({
        created_at: data?.created_at,
        created_by: data?.created_by,
      });
      setIsDraft(!!data?.is_draft);
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
      title='Checklist Item'
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
      toggleDraft={setIsDraft}
      isDraft={isDraft}
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

      <Controller
        name='action_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Action'
              link='/action'
              field={field}
              required
              options={actions}
              error={error}
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
              link='/object'
              field={field}
              options={objects}
              error={error}
            />
          );
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
            />
          );
        }}
      />

      <Controller
        control={control}
        name='guides'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/guides'
            options={commonData.guides ? commonData.guides : []}
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
        name='placement_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Placement'
              link='/placements'
              field={field}
              required={!isDraft}
              options={placements}
              error={error}
              style={{
                minWidth: '100%',
              }}
            />
          );
        }}
      />
    </ActionsDrawer>
  );
}
