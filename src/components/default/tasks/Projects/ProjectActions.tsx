'use client';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { Stack, TextField, Theme, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState, useMemo } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import ActionsDrawer from '../../common/drawers/ActionsDrawer/ActionsDrawer';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import Tasks from './Tasks/Tasks';
import Milestones from './Milestones/Milestones';
import { TasksContextProvider } from '../contexts/tasksContext';
import tasksActionOptions from './Tasks/actionOptions';
import milestonesAactionOptions from './Milestones/actionOptions';
import DateInput from '../../common/form/DateInput/DateInput';
import { IMilestoneSave, ITaskSave, IStepSave, IChecklistSave } from '../types/types';

type ProjectsTypeFields =
  | 'name'
  | 'project_template_id'
  | 'tasks'
  | 'start_date'
  | 'end_date'
  | 'milestones'
  | 'inner_client_id';

interface IFormInputs {
  name: string;
  project_template_id: number | string;
  tasks: ITaskSave[];
  start_date: string;
  end_date: string;
  reason?: string;
  milestones: IMilestoneSave[];
  inner_client_id: number | string;
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
  profile: ['name', 'project_template_id', 'inner_client_id', 'start_date', 'end_date'],
  milestone: ['milestones'],
  task: ['tasks'],
};

export default function ProjectActions({
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
  const {
    bookmarks,
    activeBookmark,
    changeActiveBookmark,
    toggleInteraction,
    getBookmarkErrorName,
    toggleBookmarkError,
  } = useBookmarks(['profile', 'task', 'milestone'], false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const {
    register,
    reset,
    clearErrors,
    setError,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      name: '',
      project_template_id: '',
      tasks: [],
      milestones: [],
      start_date: '',
      end_date: '',
      reason: '',
      inner_client_id: '',
    },
  });

  const tasks = watch('tasks');
  const milestones = watch('milestones');

  const changeTasks = (newTasks: any[]) => setValue('tasks', newTasks);
  const changeMilestones = (newMilestones: any[]) => setValue('milestones', newMilestones);

  const clearData = () =>
    reset({
      name: '',
      project_template_id: '',
      tasks: [],
      milestones: [],
      start_date: '',
      end_date: '',
      reason: '',
      inner_client_id: '',
    });

  const project_templates = commonData?.project_templates ?? [];
  const inner_clients = commonData?.inner_clients ?? [];

  const projectTemplateId = watch('project_template_id');

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    changeActiveBookmark('profile');
    toggleBookmarkError();
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as ProjectsTypeFields;
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
    mutationFn: (data: any) => apiSetData('projects', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'project' : 'projects'],
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
    mutationFn: async (data: any) => apiUpdateData(`projects/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'project' : 'projects'],
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
    queryKey: ['projects', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`projects/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const { data: projectTemplate, isFetching: projectTemplateFetching } = useQuery({
    queryKey: [`project-templates-${projectTemplateId}`, projectTemplateId],
    queryFn: async () => {
      const response = await apiGetData(`project-templates/${projectTemplateId}?isProject=1`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: !id && !!projectTemplateId,
  });

  const { taskTemplatesIds, milestoneTemplatesIds } = useMemo(() => {
    if (!projectTemplate) {
      return {
        taskTemplatesIds: [],
        milestoneTemplatesIds: [],
      };
    }
    return {
      taskTemplatesIds: projectTemplate?.task_templates.map((el: ITaskTemplate) => el.id),
      milestoneTemplatesIds: projectTemplate?.milestone_templates.map((el: ITaskTemplate) => el.id),
    };
  }, [projectTemplate]);

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
      start_date: data.start_date ? dayjs(data.start_date).format('DD-MM-YYYY') : null,
      end_date: data.end_date ? dayjs(data.end_date).format('DD-MM-YYYY') : null,
      tasks: data?.tasks.map((task) => ({
        title: task?.title,
        task_request_id: task?.task_request_id ?? null,
        parent_tasks: task?.parent_tasks ?? [],
        task_template_id: task?.task_template_id,
        status_id: task?.status_id ?? null,
        start_date: task.start_date ? dayjs(task.start_date).format('DD-MM-YYYY HH:mm:ss') : null,
        due_date: task.due_date ? dayjs(task.due_date).format('DD-MM-YYYY HH:mm:ss') : null,
        priority_id: task?.priority_id ?? null,
        note: task?.note,
        controllers: task?.controllers ?? [],
        assignees: task?.assignees ?? [],
        professions: task?.professions ?? [],
        steps: task?.steps?.map((step, ind: number) => ({
          name: step?.name,
          assignee_id: step.assignee_id,
          step_template_id: step.step_template_id,
          order: ind,
          checklists: step?.checklists?.map((checklist, ind) => ({
            name: checklist?.name,
            checklist_template_id: checklist.checklist_item_id,
            placement_id: checklist?.placement_id,
            order: ind,
          })),
        })),
      })),
      milestones: data?.milestones.map((milestone) => ({
        name: milestone?.name,
        description: milestone?.description,
        milestone_template_id: milestone?.milestone_template_id ?? null,
        start_date: milestone.start_date ? dayjs(milestone.start_date).format('DD-MM-YYYY') : null,
        end_date: milestone.end_date ? dayjs(milestone.end_date).format('DD-MM-YYYY') : null,
        tasks: milestone?.tasks.map((task) => ({
          title: task?.title,
          task_request_id: task?.task_request_id ?? null,
          parent_tasks: task?.parent_tasks ?? [],
          task_template_id: task?.task_template_id,
          status_id: task?.status_id ?? null,
          start_date: task.start_date ? dayjs(task.start_date).format('DD-MM-YYYY HH:mm:ss') : null,
          due_date: task.due_date ? dayjs(task.due_date).format('DD-MM-YYYY HH:mm:ss') : null,
          priority_id: task?.priority_id ?? null,
          note: task?.note,
          controllers: task?.controllers ?? [],
          assignees: task?.assignees ?? [],
          professions: task?.professions ?? [],
          steps: task?.steps?.map((step, ind: number) => ({
            name: step?.name,
            assignee_id: step.assignee_id,
            step_template_id: step.step_template_id,
            order: ind,
            checklists: step?.checklists?.map((checklist, ind) => {
              return {
                name: checklist?.name,
                placement_id: checklist?.placement_id,
                checklist_template_id: checklist.checklist_item_id,
                order: ind,
              };
            }),
          })),
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
        project_template_id: data.project_template?.id,
        tasks: data.tasks.map(
          (task: ITask): ITaskSave => ({
            id: task?.id,
            title: task?.title,
            parent_tasks: task?.parent_tasks.map((task) => task?.id),
            task_request_id: '',
            task_template_id: task?.task_template?.id,
            status_id: task?.status?.id,
            start_date: task?.start_date,
            due_date: task?.due_date,
            priority_id: task?.priority?.id,
            note: task?.note,
            controllers: task?.controllers.map((controller) => controller?.id),
            assignees: task?.assignees.map((assignee) => assignee?.id),
            professions: task?.professions.map((profession) => profession?.profession_id),
            steps: task?.steps.map(
              (step: IStep): IStepSave => ({
                id: step?.id,
                name: step?.name,
                assignee_id: step?.assignee?.id,
                step_template_id: step?.step_template_id,
                order: step?.order,
                checklists: step?.checklists.map(
                  (checklist: IChecklist): IChecklistSave => ({
                    id: checklist?.id,
                    name: checklist?.name,
                    placement_id: checklist?.placement?.id ?? '',
                    checklist_item_id: checklist?.checklist_item_id,
                    order: checklist?.order,
                  })
                ),
              })
            ),
          })
        ),
        milestones: data?.milestones.map(
          (milestone: IMilestone): IMilestoneSave => ({
            id: milestone?.id,
            name: milestone?.name,
            description: milestone?.description,
            start_date: milestone?.start_date,
            end_date: milestone?.end_date,
            milestone_template_id: milestone?.milestone_template_id,
            tasks: milestone?.tasks.map(
              (task: ITask): ITaskSave => ({
                id: task?.id,
                title: task?.title,
                parent_tasks: task?.parent_tasks.map((task) => task?.id),
                task_request_id: '',
                task_template_id: task?.task_template?.id,
                status_id: task?.status?.id,
                start_date: task?.start_date,
                due_date: task?.due_date,
                priority_id: task?.priority?.id,
                note: task?.note,
                controllers: task?.controllers.map((controller) => controller?.id),
                assignees: task?.assignees.map((assignee) => assignee?.id),
                professions: task?.professions.map((profession) => profession?.profession_id),
                steps: task?.steps.map(
                  (step: IStep): IStepSave => ({
                    id: step?.id,
                    name: step?.name,
                    assignee_id: step?.assignee?.id,
                    step_template_id: step?.step_template_id,
                    order: step?.order,
                    checklists: step?.checklists.map(
                      (checklist: IChecklist): IChecklistSave => ({
                        id: checklist?.id,
                        name: checklist?.name,
                        placement_id: checklist?.placement?.id ?? '',
                        checklist_item_id: checklist?.checklist_item_id,
                        order: checklist?.order,
                      })
                    ),
                  })
                ),
              })
            ),
          })
        ),
        start_date: data?.start_date,
        end_date: data?.end_date,
        inner_client_id: data?.inner_client?.id,
        reason: '',
      });
      setCreationInfo({
        created_at: data.created_at,
        created_by: data.created_by,
      });
    }
  }, [data, visible, isDuplicate]);

  useEffect(() => {
    if (!projectTemplateId || projectTemplateFetching) {
      toggleInteraction(['milestone', 'task']);
    } else {
      toggleInteraction();
    }
  }, [projectTemplateId, projectTemplateFetching]);

  useEffect(() => {
    if (!id && projectTemplate?.name) {
      setValue('name', projectTemplate.name);
    }
  }, [projectTemplate]);

  useEffect(() => {
    if (id && visible) {
      refetch();
    }
  }, [id, visible]);

  return (
    <ActionsDrawer
      id={id}
      title='Project'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      hideHandler={hideHandler}
      resetHandler={() => {
        clearData();
        changeActiveBookmark('profile');
      }}
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
      <Controller
        name='project_template_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Project template'
              link='/project-templates'
              field={field}
              options={project_templates}
              required
              error={error}
              disabled={!!id}
              style={{
                display: activeBookmark === 'profile' ? 'flex' : 'none',
                minWidth: 'calc(33.3% - 1rem)',
              }}
            />
          );
        }}
      />
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
        name='inner_client_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Inner client'
              field={field}
              link='/inner-clients'
              required
              options={inner_clients}
              error={error}
              style={{
                display: activeBookmark === 'profile' ? 'flex' : 'none',
                minWidth: 'calc(33.3% - 1rem)',
              }}
            />
          );
        }}
      />

      <Stack flexDirection='row' gap='1rem'>
        <Controller
          name='start_date'
          control={control}
          render={({ field }) => (
            <DateInput
              required
              label={'Start Date'}
              format='DD-MM-YYYY'
              error={errors?.start_date}
              style={{
                display: activeBookmark === 'profile' ? 'flex' : 'none',
                width: '50%',
              }}
              field={field}
            />
          )}
        />

        <Controller
          name='end_date'
          control={control}
          render={({ field }) => (
            <DateInput
              required
              label={'End Date'}
              format='DD-MM-YYYY'
              error={errors?.end_date}
              style={{
                display: activeBookmark === 'profile' ? 'flex' : 'none',
                width: '50%',
              }}
              field={field}
            />
          )}
        />
      </Stack>
      <TasksContextProvider
        elems={tasks}
        selectedIds={taskTemplatesIds}
        actionOptions={tasksActionOptions}
        updateElems={changeTasks}
        hierarchy={['tasks', 'steps', 'checklists']}
      >
        <Tasks
          control={control}
          visible={activeBookmark === 'task'}
          fullScreen={fullScreen}
          commonData={commonData}
          clearErrors={() => clearErrors('tasks')}
          isEdit={!!id}
          errors={errors['tasks' as keyof typeof errors] ?? []}
        />
      </TasksContextProvider>
      <TasksContextProvider
        elems={milestones}
        selectedIds={milestoneTemplatesIds}
        actionOptions={milestonesAactionOptions}
        updateElems={changeMilestones}
        hierarchy={['milestones', 'tasks', 'steps', 'checklists']}
      >
        <Milestones
          control={control}
          fullScreen={fullScreen}
          visible={activeBookmark === 'milestone'}
          commonData={commonData}
          isEdit={!!id}
          clearErrors={() => clearErrors('milestones')}
          errors={errors['milestones' as keyof typeof errors] ?? []}
        />
      </TasksContextProvider>
    </ActionsDrawer>
  );
}
