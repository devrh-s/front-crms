'use client';
import ActivitiesPage from '@/components/default/blocks/Activities/Activities';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Chip,
  Stack,
  Theme,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { isNumber } from 'lodash';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Date from '../../common/components/Date';
import MoreChips from '../../common/components/MoreChips';
import Status from '../../common/components/Status';
import Timer from '../../common/components/Timer';
import UserChip from '../../common/components/UserChip';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import Modal from '../../common/modals/Modal/Modal';
import GuideInfo from '../components/GuideInfo';
import TaskAddEdit from './TaskAddEdit';
import TaskInfo from './TaskProfileInfo';
import TaskResult from './TaskResult';
import { ITaskProfileProps, ITasksProfileFormInputs, TasksProfileFields } from './types';

export default function TasksProfile({
  id,
  commonData,
  visible,
  isProfile = false,
  editActions,
  handleActions,
}: ITaskProfileProps) {
  const showNotification = useNotification();
  const [fullScreen, setFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<IStep[] | null>(null);
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile', 'steps', 'trackers', 'edits', 'activities', 'results'],
    visible
  );
  const [stepModal, setStepModal] = useState<IStep | null>(null);
  const [statusTask, setStatusTask] = useState<ITask | null>(null);

  const statuses = commonData.statuses ?? [];

  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const {
    register,
    reset,
    control,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<ITasksProfileFormInputs>({
    defaultValues: {
      status_id: '',
      task_results: [],
    },
  });
  const statusId = watch('status_id');

  const clearData = () =>
    reset({
      status_id: '',
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
      const errorKey = key as TasksProfileFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
  };

  const queryClient = useQueryClient();
  const { data, isFetching, refetch } = useQuery({
    queryKey: ['task', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`tasks/${id}`);
      setIsLoading(false);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiSetData(data.path, data.data),
    onSuccess: (result) => {
      if (result.success) {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['tasks'],
          }),
          queryClient.invalidateQueries({
            queryKey: ['task'],
          }),
        ]);

        showNotification(result.message, 'success');
        setIsLoading(false);
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
      setIsLoading(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiUpdateData(data.path, data.data),
    onSuccess: (result) => {
      if (result.success) {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['tasks'],
          }),
          queryClient.invalidateQueries({
            queryKey: ['task'],
          }),
          queryClient.invalidateQueries({
            queryKey: ['taskboard'],
          }),
        ]);
        showNotification(result.message, 'success');
        setIsLoading(false);
        setStatusTask(null);
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
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (data) {
      setCreationInfo({
        created_at: data?.created_at,
        created_by: data?.created_by,
      });
    }
  }, [data, visible]);

  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id]);

  const setIsCompletedStep = (step: IStep, event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const data = {
      path: `steps/${step.id}/is-completed`,
      data: { is_completed: event.target.checked ? 1 : 0 },
    };

    updateMutation.mutate(data);
  };
  const setIsCompletedTask = (task: ITask, event: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const data = {
      path: `tasks/${task.id}/is-completed`,
      data: { is_completed: event.target.checked ? 1 : 0 },
    };

    updateMutation.mutate(data);
  };
  const setIsCompletedChecklist = (
    checklist: IChecklist,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsLoading(true);
    const data = {
      path: `checklists/${checklist.id}/is-completed`,
      data: { is_completed: event.target.checked ? 1 : 0 },
    };

    updateMutation.mutate(data);
  };
  const setIsCompletedStepEdit = (
    step: IStep,
    edit: any,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsLoading(true);

    const data = {
      path: `steps/${step.id}/edit-progress/${edit.id}/is-completed`,
      data: { is_completed: event.target.checked ? 1 : 0 },
    };
    updateMutation.mutate(data);
  };

  const changeStatus = (task: ITask) => {
    setIsLoading(true);
    const data = {
      path: `tasks/${task.id}/change-status`,
      data: { status_id: statusId },
    };

    updateMutation.mutate(data);
    reset({
      status_id: '',
    });
  };
  const startTimerStep = (step: IStep) => {
    setIsLoading(true);
    const data = {
      path: `steps/${step.id}/start`,
      data: { step_id: step.id },
    };

    createMutation.mutate(data);

    setStepModal(null);
  };
  const stopTimerStep = (step: IStep) => {
    setIsLoading(true);
    const data = {
      path: `steps/${step.id}/end`,
      data: { step_id: step.id },
    };

    updateMutation.mutate(data);

    setStepModal(null);
  };
  useEffect(() => {
    if (data) {
      setSteps(data.steps.sort((a: any, b: any) => a.order - b.order));
    }
  }, [data]);

  return (
    <ActionsDrawer
      id={id}
      title={data?.title ? data?.title : ''}
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      hideHandler={hideHandler}
      resetHandler={clearData}
      changeActiveBookmark={changeActiveBookmark}
      toggleBookmarkError={toggleBookmarkError}
      fullScreenHandler={fullScreenHandler}
      fullScreen={fullScreen}
      isLoading={isFetching}
      register={register}
      errors={errors}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <Checkbox
          disabled={isLoading}
          checked={data?.is_completed === 1 ? true : false}
          onChange={(event) => setIsCompletedTask(data, event)}
        />
        <Typography sx={{ fontWeight: 500, fontSize: '18px' }}>Task Completed</Typography>
      </Box>
      <TaskInfo
        activeBookmark={activeBookmark}
        data={data}
        editActions={editActions}
        setStatusTask={setStatusTask}
        setValue={setValue}
      />
      {activeBookmark === 'steps' && (
        <Stack gap={'1rem'}>
          {steps &&
            steps.length > 0 &&
            steps.map((step: IStep) => (
              <Stack
                gap={'2rem'}
                key={step.id}
                sx={{
                  border: '1px solid #e5e5e5',
                  p: '0.5rem',
                  borderRadius: '0.5rem',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0rem',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      flex: '1',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {' '}
                        <Checkbox
                          disabled={isLoading}
                          checked={step?.is_completed === 1 ? true : false}
                          onChange={(event) => setIsCompletedStep(step, event)}
                        />
                        <Typography sx={{ fontWeight: 500, fontSize: '20px' }}>
                          {step?.name}
                        </Typography>
                      </Box>
                      <UserChip data={step.assignee} />
                    </Box>
                    {step.tracker && !step.tracker?.end_date ? (
                      <Timer startDate={step.tracker?.start_date} />
                    ) : (
                      <Chip
                        variant='outlined'
                        color='info'
                        size='small'
                        sx={{ fontSize: '18px' }}
                        label={`00:00:00:00`}
                      ></Chip>
                    )}
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Button
                      disabled={isLoading}
                      size='small'
                      sx={{ alignSelf: 'end' }}
                      variant='contained'
                      onClick={() => setStepModal(step)}
                    >
                      Add edit
                    </Button>
                    <Button
                      sx={{
                        display: step.tracker && !step.tracker?.end_date ? 'none' : 'block',
                      }}
                      disabled={isLoading}
                      size='small'
                      variant='contained'
                      onClick={() => startTimerStep(step)}
                    >
                      Start timer
                    </Button>
                    <Button
                      sx={{
                        display: step.tracker?.end_date !== null ? 'none' : 'block',
                      }}
                      color='error'
                      disabled={isLoading}
                      size='small'
                      variant='contained'
                      onClick={() => stopTimerStep(step)}
                    >
                      Stop timer
                    </Button>
                  </Box>
                </Box>

                {step.checklists.length > 0 && (
                  <Stack
                    gap={'0rem'}
                    sx={{
                      ml: '1rem',
                      pl: '1rem',
                      borderLeft: '1px solid #e5e5e5',
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: '18px' }}>Checklists:</Typography>
                    {step.checklists?.map((checklist) => {
                      return (
                        <>
                          <Box
                            key={checklist.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              justifyContent: 'space-between',
                              gap: '1rem',
                              rowGap: '0.5rem',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',

                                gap: '1rem',
                              }}
                            >
                              <Checkbox
                                disabled={isLoading}
                                checked={checklist?.is_completed === 1 ? true : false}
                                onChange={(event) => setIsCompletedChecklist(checklist, event)}
                              />

                              {checklist?.placement?.link ? (
                                <Link href={checklist?.placement?.link} target='_blank'>
                                  <Typography color={'primary'}>{checklist?.name}</Typography>
                                </Link>
                              ) : (
                                <Typography>{checklist?.name}</Typography>
                              )}
                            </Box>
                            <Box>
                              <MoreChips
                                data={
                                  checklist?.placement?.accounts
                                    ? checklist?.placement?.accounts
                                    : []
                                }
                              />
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              p: '0.5rem',
                            }}
                          >
                            {checklist?.guides?.length > 0 &&
                              checklist.guides?.map((el, index) => (
                                <Accordion
                                  key={`${el.id}_${index}`}
                                  sx={{
                                    width: '100%',
                                  }}
                                >
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls='panel1-content'
                                    id='panel1-header'
                                  >
                                    Guide: {el?.name} (ID:{el?.id}):
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <GuideInfo guide={el} />
                                  </AccordionDetails>
                                </Accordion>
                              ))}
                          </Box>
                        </>
                      );
                    })}
                  </Stack>
                )}
                {step.edit_progress?.length > 0 && (
                  <Stack
                    gap={'0.5rem'}
                    sx={{
                      ml: '1rem',
                      pl: '1rem',
                      borderLeft: '1px solid #e5e5e5',
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: '18px' }}>Step Edits:</Typography>
                    {step.edit_progress?.map((edit: any) => (
                      <Box
                        key={edit.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          pb: '0.5rem',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                          }}
                        >
                          <Checkbox
                            disabled={isLoading}
                            checked={edit?.done === 1 ? true : false}
                            onChange={(event) => setIsCompletedStepEdit(step, edit, event)}
                          />
                          <Typography>{edit?.edit?.name}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Stack>
            ))}
        </Stack>
      )}
      {activeBookmark === 'trackers' && (
        <Stack gap={'0.5rem'}>
          <Typography
            sx={{
              fontWeight: 500,
            }}
          >
            Total time: {data?.total_time}
          </Typography>
          {steps &&
            steps.length > 0 &&
            steps.map(
              (step: IStep, index: number) =>
                step.trackers &&
                step.trackers.length > 0 && (
                  <Accordion
                    key={`${step.name.toLowerCase().replace(' ', '_')}_${index}`}
                    sx={{
                      width: '100%',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls='panel1-content'
                      id='panel1-header'
                    >
                      {step.name}
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack gap={'0.5rem'}>
                        {step.trackers &&
                          step.trackers?.map((tracker) => (
                            <Stack
                              key={tracker?.id}
                              sx={{
                                border: '1px solid #0000001f',
                                borderRadius: '0.5rem',
                                p: '0.5rem',
                              }}
                            >
                              <Typography sx={{ fontWeight: 500 }}>
                                Total time: {tracker?.total_time}
                              </Typography>
                              <Typography>
                                Start:{' '}
                                {dayjs(tracker?.start_date)
                                  .add(dayjs().utcOffset(), 'minute')
                                  .format('DD-MM-YYYY HH:mm:ss')}
                              </Typography>
                              <Typography>
                                End:{' '}
                                {tracker?.end_date
                                  ? dayjs(tracker?.end_date)
                                      .add(dayjs().utcOffset(), 'minute')
                                      .format('DD-MM-YYYY HH:mm:ss')
                                  : '-'}
                              </Typography>
                            </Stack>
                          ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                )
            )}
        </Stack>
      )}
      {activeBookmark === 'edits' && (
        <Stack gap={'0.5rem'}>
          {steps &&
            steps.length > 0 &&
            steps.map(
              (step: IStep, index: number) =>
                step.edit_progress?.length > 0 && (
                  <Accordion
                    key={`${step.name.toLowerCase().replace(' ', '_')}_${index}`}
                    sx={{
                      width: '100%',
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      {step?.name}
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack gap={'0.5rem'}>
                        {step.edit_progress &&
                          step.edit_progress?.map((el) => (
                            <Stack
                              key={el?.id}
                              className={el?.done === 1 ? 'done' : ''}
                              gap={'0.5rem'}
                              sx={{
                                border: '1px solid #0000001f',
                                borderRadius: '0.5rem',
                                p: '0.5rem',
                                '&.done': {
                                  borderColor: (theme: Theme) => theme?.palette?.primary?.main,
                                },
                              }}
                            >
                              <Typography sx={{ fontWeight: 500 }}>
                                {el.edit.name} (ID:{el.id})
                              </Typography>

                              <Typography>Block: {el.edit?.block?.name}</Typography>
                              {el.status && (
                                <Typography>
                                  Status: <Status name={el.status?.name} color={el.status?.color} />
                                </Typography>
                              )}

                              <Typography>Type: {el.type ? el.type : ''}</Typography>

                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                }}
                              >
                                <Typography>Done: </Typography>
                                {el.done ? <TaskAltIcon /> : '-'}
                              </Box>
                              <Typography>
                                Completed at:{' '}
                                {el.completed_at
                                  ? dayjs(el.completed_at).format('DD-MM-YYYY hh:mm:ss')
                                  : '-'}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  gap: '1rem',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Date date={el.created_at} />
                                <UserChip data={el.created_by} />
                              </Box>
                            </Stack>
                          ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                )
            )}
        </Stack>
      )}
      {activeBookmark === 'activities' && id && (
        <ActivitiesPage fullScreen={fullScreen} url={`tasks/${id}/activities`} />
      )}

      <TaskResult
        id={id}
        fullScreen={fullScreen}
        defaultTaskResults={data?.task_results}
        activeBookmark={activeBookmark}
      />

      <TaskAddEdit commonData={commonData} setStepModal={setStepModal} step={stepModal} />
      <Modal
        title={`Change status for ${statusTask?.title}`}
        open={!!statusTask}
        handleClose={() => setStatusTask(null)}
      >
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pt: '3rem',
          }}
        >
          <Button
            disabled={!isNumber(statusId)}
            sx={{
              minWidth: '240px',
            }}
            variant='contained'
            onClick={() => {
              changeStatus(statusTask as ITask);
            }}
          >
            Submit
          </Button>
        </Box>
      </Modal>
    </ActionsDrawer>
  );
}
