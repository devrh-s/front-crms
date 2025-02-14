'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomTextEditor from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Box, Button, Stack, TextField, Theme, Typography, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import MoreChips from '../../common/components/MoreChips';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import CustomSelect from '../../common/form/CustomSelect/CustomSelect';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import DateInput from '../../common/form/DateInput/DateInput';
import GuideModal from './TaskSteps/GuideModal';
import stepsReducer from './TaskSteps/stepsReducer';
import TaskSteps from './TaskSteps/TaskSteps';
import TaskInputs from '../components/TaskInputs';
import {
  IFormInputs,
  ISelectedTemplateProps,
  IStep,
  ITasksActionsProps,
  TasksFields,
} from './types';

const bookmarkErrorRelations = {
  profile: [
    'task_template_id',
    'status_id',
    'title',
    'priority_id',
    'controllers',
    'assignees',
    'notes',
    'professions',
    'start_date',
    'due_date',
  ],
  steps: ['steps'],
};

const getDefaultFormInputs = (): IFormInputs => ({
  task_template_id: '',
  assignees: [],
  controllers: [],
  title: '',
  professions: [],
  status_id: 10,
  priority_id: '',
  note: '',
  reason: '',
  due_date: null,
  start_date: null,
  parent_tasks: [],
  steps: [],
});

const getInvalidationQuery = (isProfile: boolean, taskRequest: boolean) => {
  if (isProfile) {
    return taskRequest ? 'task-request' : 'task';
  }
  return taskRequest ? 'task-requests' : 'tasks';
};

function SelectedTemplate({
  template,
  activeBookmark,
  startCreationProcess,
}: ISelectedTemplateProps) {
  return (
    <Stack gap='1rem' sx={{ display: activeBookmark === 'profile' ? 'flex' : 'none' }}>
      {!startCreationProcess && (
        <Stack flexDirection='row' gap='.5rem' alignItems='flex-end'>
          <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
            Name:
          </Typography>
          <Typography>{template?.name}</Typography>
        </Stack>
      )}
      <Stack flexDirection='row' gap='.5rem' alignItems='flex-end'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Cost:
        </Typography>
        <Typography>{template?.cost}</Typography>
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='flex-end'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Expected hours:
        </Typography>
        <Typography>{template?.expected_hours}</Typography>
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='flex-end'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Task Templates:
        </Typography>
        <Typography>{template?.task_templates?.name}</Typography>
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='flex-end'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Frequency:
        </Typography>
        <Typography>{template?.frequency?.name}</Typography>
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='flex-end'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Task Quantity:
        </Typography>
        <Typography>{template?.task_quantity}</Typography>
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='flex-end'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Profession:
        </Typography>
        <MoreChips data={template?.professions} propName='name' />
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='flex-end'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Step Templates:
        </Typography>
        <MoreChips data={template?.step_templates} propName='name' />
      </Stack>
    </Stack>
  );
}

export default function TasksActions({
  id,
  commonData,
  visible,
  isProfile = false,
  isDuplicate = false,
  handleActions,
  taskRequest = null,
}: ITasksActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const [selectedTaskTemplate, setSelectedTaskTemplate] = useState<ITaskTemplate | null>(null);
  const [guideModal, setGuideModal] = useState<IGuideType | null>(null);
  const [startCreationProcess, setStartCreationProcess] = useState(false);
  const {
    activeBookmark,
    bookmarks,
    changeActiveBookmark,
    toggleBookmarkError,
    getBookmarkErrorName,
    toggleInteraction,
  } = useBookmarks(['profile', 'steps'], visible);
  const [steps, dispatch] = useReducer(stepsReducer, []);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);

  const task_templates = commonData.task_templates ?? [];
  const statuses = commonData.statuses ?? [];
  // const priorities = commonData.priorities ?? [];
  // const users = commonData.users ?? [];
  // const tasks = commonData.tasks ?? [];
  // const professions = commonData.professions ?? [];

  const pendingStatusId = useMemo(() => {
    const pendingStatus = statuses.find((status) => status?.name === 'Pending');
    return pendingStatus ? pendingStatus.id : '';
  }, [statuses]);

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
  const watchTemplate = watch('task_template_id');
  const assignees = watch('assignees');

  const clearData = () => {
    reset(getDefaultFormInputs());
    setSelectedTaskTemplate(null);
    setStartCreationProcess(false);
    changeActiveBookmark('profile');
    dispatch({ type: 'clearSteps', payload: null });
  };

  const fullScreenHandler = () => setFullScreen(!fullScreen);
  const handleSetModal = useCallback((data: IGuideType | null) => setGuideModal(data), []);
  const queryClient = useQueryClient();

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as TasksFields;
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

  const createMutation = useMutation({
    mutationFn: (data: any) => apiSetData('tasks', data),
    onSuccess: (result) => {
      if (result.success) {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: [getInvalidationQuery(isProfile, !!taskRequest)],
          }),
          queryClient.invalidateQueries({
            queryKey: ['taskboard'],
          }),
        ]);
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
    mutationFn: async (data: any) => apiUpdateData(`tasks/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['tasks'],
          }),
          queryClient.invalidateQueries({
            queryKey: ['taskboard'],
          }),
        ]);
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
    queryKey: [`tasks-${id}`],
    queryFn: async () => {
      const response = await apiGetData(`tasks/${id}?isShort=1`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const selectedSteps = useMemo(() => {
    if (id && data?.steps?.length) return data?.steps;
    return selectedTaskTemplate?.step_templates
      ? selectedTaskTemplate?.step_templates.map((el) => el.id)
      : [];
  }, [startCreationProcess, selectedTaskTemplate, data, visible]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
      due_date: data.due_date ? dayjs(data.due_date).format('DD-MM-YYYY HH:mm:ss') : null,
      start_date: data.start_date ? dayjs(data.start_date).format('DD-MM-YYYY HH:mm:ss') : null,
      steps: steps.map((step: IStep, ind: number) => {
        return {
          name: step?.name,
          assignee_id: step.assignee,
          step_template_id: step?.step_template_id
            ? step.step_template_id
            : typeof step?.id === 'number'
              ? step?.id
              : null,
          order: ind,
          checklists: step?.checklist_items?.map((checklist, ind) => {
            return {
              checklist_item_id: checklist?.checklist_item_id
                ? checklist.checklist_item_id
                : typeof checklist?.id === 'number'
                  ? checklist?.id
                  : null,
              name: checklist?.name,
              placement_id: checklist?.placement_id,
              order: ind,
            };
          }),
        };
      }),
    };
    if (taskRequest) {
      commonData.task_request_id = taskRequest.id;
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

  const getTaskDescription = () => {
    if (id) return getValues('note');
    return selectedTaskTemplate?.description ?? '';
  };

  useEffect(() => {
    if (data) {
      reset({
        task_template_id: data.task_template.id,
        title: `${isDuplicate ? `${data?.title} COPY` : data?.title}`,
        note: data.note,
        status_id: data.status.id,
        priority_id: data.priority.id,
        parent_tasks: data.parent_tasks.map((el: any) => el.id),
        assignees: data.assignees.map((el: any) => el.id),
        controllers: data.controllers.map((el: any) => el.id),
        professions: data.professions.map((el: any) => el.profession_id),
        start_date: data.start_date,
        due_date: data.due_date,
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
    if (taskRequest) {
      reset({
        task_template_id: taskRequest.task_template?.id ? taskRequest.task_template?.id : '',
        note: taskRequest.description ? taskRequest.description : '',
        priority_id: taskRequest.priority?.id ? taskRequest.priority?.id : '',
        assignees: taskRequest.assignees ? taskRequest.assignees.map((el: any) => el.id) : [],
        start_date: null,
        due_date: null,
      });
    }
  }, [taskRequest, visible]);

  useEffect(() => {
    if (id && visible) {
      refetch();
      setStartCreationProcess(true);
    }
    if (!visible) {
      changeActiveBookmark('profile');
    }
  }, [id, visible]);

  useEffect(() => {
    if (!startCreationProcess) {
      toggleInteraction('steps');
    } else {
      toggleInteraction();
    }
  }, [startCreationProcess]);

  useEffect(() => {
    if (watchTemplate && !id) {
      const selectedTemplateData = task_templates.find((el) => el.id === +watchTemplate);
      const professions = selectedTemplateData?.professions?.map((el) => el.profession_id);
      setSelectedTaskTemplate(selectedTemplateData as ITaskTemplate);
      setValue('title', selectedTemplateData?.name ?? '');
      setValue('note', selectedTaskTemplate?.description ?? '');
      setValue('status_id', pendingStatusId);
      setValue('professions', professions ?? []);
    } else if (!id) {
      setSelectedTaskTemplate(null);
      setStartCreationProcess(false);
    }
  }, [watchTemplate, pendingStatusId, id]);

  return (
    <ActionsDrawer
      id={id}
      title='Task'
      isCreateVisible={startCreationProcess}
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
      <Stack width='100%' gap='1rem'>
        <Controller
          name='task_template_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Task Template'
                link='/task-templates'
                field={field}
                required
                options={task_templates}
                error={error}
                style={{
                  display: activeBookmark === 'profile' ? 'flex' : 'none',
                  minWidth: 375,
                }}
              />
            );
          }}
        />

        <Box
          sx={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            rowGap: '2rem',
          }}
        >
          {selectedTaskTemplate && (
            <SelectedTemplate
              activeBookmark={activeBookmark}
              template={selectedTaskTemplate}
              startCreationProcess={startCreationProcess}
            />
          )}
          {!startCreationProcess && (
            <Stack
              className={mdDown ? 'mobile' : ''}
              sx={{
                position: 'relative',
                paddingBottom: '2px',
                width: '100%',
                '&.mobile': {
                  width: '100%',
                },
              }}
            >
              <Button
                disabled={!selectedTaskTemplate}
                variant='contained'
                size='large'
                className={mdDown ? 'mobile' : ''}
                sx={{
                  alignSelf: fullScreen ? 'center' : 'unset',
                  minWidth: '340px',
                  '&.mobile': {
                    minWidth: '0',
                  },
                }}
                onClick={() => setStartCreationProcess(true)}
                endIcon={<AddCircleOutlineIcon />}
              >
                Create Task
              </Button>
            </Stack>
          )}
        </Box>
      </Stack>
      {!!startCreationProcess && (
        <TaskInputs
          visible={activeBookmark === 'profile'}
          control={control}
          commonData={commonData}
          fullScreen={fullScreen}
          selectAssignees={() => {}}
          nameKeys={{
            title: 'title',
            status_id: 'status_id',
            priority_id: 'priority_id',
            parent_tasks: 'parent_tasks',
            start_date: 'start_date',
            due_date: 'due_date',
            professions: 'professions',
            assignees: 'assignees',
            controllers: 'controllers',
            note: 'note',
          }}
        />
      )}
      <Stack
        sx={{
          display: activeBookmark === 'steps' ? 'flex' : 'none',
          width: '100%',
        }}
        gap='1rem'
      >
        <Box textAlign='center'>
          <Typography
            textAlign='center'
            color={errors.steps ? 'error' : 'inherit'}
            sx={{
              fontSize: '1.2rem',
            }}
          >
            {getValues('title')}
            <Typography
              component='span'
              color='error'
              sx={{ marginLeft: '4px', fontSize: '1.2rem' }}
            >
              *
            </Typography>
          </Typography>
          {errors.steps && (
            <Typography
              color='error'
              sx={{
                fontSize: '0.875rem',
                marginTop: '4px',
              }}
            >
              {errors?.steps.message}
            </Typography>
          )}
        </Box>
        <Typography
          textAlign='center'
          sx={{
            fontSize: '1.2rem',
          }}
        >
          Steps
        </Typography>
        <TaskSteps
          steps={steps}
          dispatch={dispatch}
          handleSetModal={handleSetModal}
          stepsIds={selectedSteps}
          fullScreen={fullScreen}
          commonData={commonData}
          taskTemplateId={selectedTaskTemplate?.id}
          assignees={assignees}
          clearErrors={clearErrors}
          errors={errors['steps' as keyof typeof errors] ?? []}
          visible={visible}
          isUpdate={!!id}
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
