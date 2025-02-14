'use client';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { Box, Stack, TextField, Theme, Typography, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import ActionsDrawer from '../../common/drawers/ActionsDrawer/ActionsDrawer';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import GuideModal from './TaskTemplates/GuideModal';
import tasksReducer from './TaskTemplates/tasksReducer';
import TaskTemplates from './TaskTemplates/TaskTemplates';

type PlacementTypeFields = 'name' | 'description' | 'task_templates';

interface IFormInputs {
  name: string;
  description: string;
  task_templates: [];
  reason: string;
}

interface ICityActionsProps {
  id: number | null;
  visible: boolean;
  commonData: ICommonData;
  isProfile?: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

const bookmarkErrorRelations = {
  profile: ['name'],
  task_templates: ['task_templates'],
};

const getDefaultTaskTemplates = () => ({
  task_templates: [],
});

export default function MilestoneTemplatesActions({
  id,
  commonData,
  isProfile = false,
  isDuplicate = false,
  visible,
  handleActions,
}: ICityActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const [guideModal, setGuideModal] = useState<IGuideType | null>(null);
  const {
    activeBookmark,
    changeActiveBookmark,
    toggleBookmarkError,
    getBookmarkErrorName,
    bookmarks,
  } = useBookmarks(['profile', 'task_templates'], false);
  const [tasks, dispatch] = useReducer(tasksReducer, []);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const editorDescriptionRef = useRef<IEditor | null>(null);

  const {
    register,
    reset,
    clearErrors,
    setError,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      name: '',
      description: '',
      reason: '',
      task_templates: [],
    },
  });

  const clearData = () => {
    reset({
      name: '',
      description: '',
      reason: '',
      task_templates: [],
    });
    dispatch({ type: 'clearTaskTemplates', payload: null });
  };

  const fullScreenHandler = () => setFullScreen(!fullScreen);
  const handleSetModal = useCallback((data: IGuideType | null) => setGuideModal(data), []);

  const hideHandler = (clearOnClose: boolean = true) => {
    if (id || clearOnClose || isDuplicate) {
      clearData();
    }
    dispatch({ type: 'clearTaskTemplates', payload: null });
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as PlacementTypeFields;
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
    mutationFn: (data: any) => apiSetData('milestone-templates', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'milestone-template' : 'milestone-templates'],
        });
        hideHandler();
        showNotification('Successfully created', 'success');
        toggleBookmarkError();
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
    mutationFn: async (data: any) => apiUpdateData(`milestone-templates/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'milestone-template' : 'milestone-templates'],
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
    queryKey: ['milestone-templates', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`milestone-templates/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
      task_templates: tasks.map((task: ITaskTemplate) => ({
        id: task.id,
        step_templates: task?.step_templates?.map((step: IStepTemplate) => ({
          id: step.id,
          checklist_items: step.checklist_items.map(
            (checklist: IChecklistItemType) => checklist.id
          ),
        })),
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
      reset({
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        description: data?.description,
        task_templates: data.task_templates.map((el: any) => el.id),
      });
      dispatch({ type: 'setTaskTemplates', payload: data.task_templates });
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
      title='Milestone Template'
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
      isDuplicate={isDuplicate}
    >
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('name')}
        label={<CustomLabel label={'Name'} required />}
        error={!!errors.name}
        helperText={errors.name ? errors.name?.message : ''}
        className={mdDown ? 'mobile' : ''}
        sx={{
          display: activeBookmark === 'profile' ? 'flex' : 'none',
          minWidth: 'calc(50% - 1rem)',
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

      <Stack
        sx={{
          display: activeBookmark === 'task_templates' ? 'flex' : 'none',
          width: '100%',
        }}
        gap='1rem'
      >
        <Typography variant='h5' textAlign='center'>
          {getValues('name')}
        </Typography>

        <Box textAlign='center'>
          <Typography
            textAlign='center'
            color={errors?.task_templates ? 'error' : 'inherit'}
            sx={{
              fontSize: '1.2rem',
            }}
          >
            Task Templates
            <Typography
              component='span'
              color='error'
              sx={{ marginLeft: '4px', fontSize: '1.2rem' }}
            >
              *
            </Typography>
          </Typography>
          {errors?.task_templates && (
            <Typography
              color='error'
              sx={{
                fontSize: '0.875rem',
                marginTop: '4px',
              }}
            >
              {errors?.task_templates.message}
            </Typography>
          )}
        </Box>

        <TaskTemplates
          tasks={tasks}
          dispatch={dispatch}
          handleSetModal={handleSetModal}
          fullScreen={fullScreen}
          commonData={commonData}
          clearErrors={clearErrors}
          errors={errors['task_templates' as keyof typeof errors] ?? []}
        />
        <GuideModal
          open={!!guideModal}
          name={guideModal?.name}
          id={guideModal?.id}
          handleSetModal={handleSetModal}
        />
      </Stack>
    </ActionsDrawer>
  );
}
