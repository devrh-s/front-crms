'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { Stack, TextField, Theme, Typography, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import CustomSelect from '../../common/form/CustomSelect/CustomSelect';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import GuideModal from './TaskTemplateSteps/GuideModal';
import TaskTemplateSteps from './TaskTemplateSteps/TaskTemplateSteps';
import stepsReducer from './TaskTemplateSteps/stepsReducer';
import { IStep } from './types';

const bookmarkErrorRelations = {
  profile: [
    'name',
    'description',
    'cost',
    'action_id',
    'object_id',
    'tool_id',
    'frequency_id',
    'professions',
  ],
  step_templates: ['stepTemplates'],
};

type StepTemplatesFields =
  | 'name'
  | 'description'
  | 'cost'
  | 'action_id'
  | 'object_id'
  | 'frequency_id'
  | 'professions'
  | 'stepTemplates';

interface IFormInputs {
  name: string;
  description: string;
  cost: number | string;
  frequency_id: number | string;
  professions: number[] | [];
  action_id: number | string;
  object_id: number | string;
  parentTaskTemplates: number[];
  stepTemplates: { id: number; checklist_items: number[] }[];
  reason: string;
}

interface ITaskTemplatesActionsProps {
  id: number | null;
  visible: boolean;
  isCopy?: boolean;
  commonData: ICommonData;
  isProfile?: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
  setIsCopy?: any;
}

export default function TaskTemplatesActions({
  id,
  commonData,
  isProfile = false,
  visible,
  handleActions,
  isCopy = false,
  isDuplicate = false,
  setIsCopy,
}: ITaskTemplatesActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const [guideModal, setGuideModal] = useState<IGuideType | null>(null);
  const {
    activeBookmark,
    bookmarks,
    changeActiveBookmark,
    toggleBookmarkError,
    getBookmarkErrorName,
  } = useBookmarks(['profile', 'step_templates'], visible);
  const [steps, dispatch] = useReducer(stepsReducer, []);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const editorDescriptionRef = useRef<IEditor | null>(null);

  const professions = commonData.professions ?? [];
  const frequencies = commonData.frequencies ?? [];
  const actions = commonData.actions ?? [];
  const objects = commonData.objects ?? [];
  const task_templates = commonData.task_templates ?? [];

  const {
    register,
    reset,
    setValue,
    getValues,
    watch,
    clearErrors,
    control,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      name: '',
      description: '',
      cost: '',
      action_id: '',
      object_id: '',
      frequency_id: '',
      stepTemplates: [],
      parentTaskTemplates: [],
      professions: [],
      reason: '',
    },
  });

  const clearData = () => {
    reset({
      name: '',
      description: '',
      cost: '',
      action_id: '',
      object_id: '',
      stepTemplates: [],
      parentTaskTemplates: [],
      professions: [],
      reason: '',
    });
    changeActiveBookmark('profile');
    dispatch({ type: 'clearSteps', payload: null });
  };

  const fullScreenHandler = () => setFullScreen(!fullScreen);
  const handleSetModal = useCallback((data: IGuideType | null) => setGuideModal(data), []);

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    if (isCopy) {
      setIsCopy(false);
    }
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as StepTemplatesFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      if (errorKey.startsWith('stepTemplates')) {
        setError('stepTemplates', error);
      }
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
    mutationFn: (data: any) => apiSetData('task-templates', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'task-template' : 'task-templates'],
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
    mutationFn: async (data: any) => apiUpdateData(`task-templates/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        if (!isProfile) {
          queryClient.invalidateQueries({
            queryKey: ['task-templates'],
          });
        }
        queryClient.invalidateQueries({ queryKey: ['task-template', id] });
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
    queryKey: ['task-template', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`task-templates/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: !!id,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
      description: editorDescriptionRef.current?.getContent(),
      is_draft: isDraft,
      stepTemplates: steps.map((step: IStep) => ({
        id: typeof step?.id === 'number' ? step?.id : null,
        checklist_items: step?.checklist_items?.map((checklist) =>
          typeof checklist?.id === 'number' ? checklist?.id : null
        ),
      })),
    };
    if (id && !isCopy && !isDuplicate) {
      updateMutation.mutate(commonData);
    } else {
      createMutation.mutate(commonData);
      if (isCopy) {
        setIsCopy(false);
      }
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
        cost: data?.cost,
        frequency_id: data?.frequency?.id,
        description: data?.description,
        parentTaskTemplates: data?.parent_task_templates?.map((el: any) => el?.id),
        professions: data?.professions.map((el: any) => el?.profession_id),
        action_id: data?.action?.action_id,
        object_id: data?.object?.object_id,
        reason: '',
      });
      dispatch({ type: 'setSteps', payload: data.step_templates });
      setCreationInfo({
        created_at: data?.created_at,
        created_by: data?.created_by,
      });
      setIsDraft(!!data?.is_draft);
    }
  }, [data, visible, isDuplicate]);

  // useEffect(() => {
  //   if (id && visible) {
  //     refetch();
  //   }
  // }, [id, visible]);

  const actionField = watch('action_id');
  const objectField = watch('object_id');

  const actionName = useMemo(() => {
    return actions.find((obj) => obj.id === getValues('action_id'))?.name ?? '';
  }, [actions, actionField]);

  const objectName = useMemo(() => {
    return objects.find((obj) => obj.id === getValues('object_id'))?.name ?? '';
  }, [objects, objectField]);

  useEffect(() => {
    setValue('name', `${actionName} ${objectName}`);
  }, [actionName, objectName, setValue]);

  return (
    <ActionsDrawer
      id={id}
      isCopy={isCopy}
      title='Task Template'
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
      <Controller
        name='action_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Action'
              link='/actions'
              field={field}
              options={actions}
              required
              error={error}
              style={{
                display: activeBookmark === 'profile' ? 'flex' : 'none',
                minWidth: 'calc(33.3% - 1rem)',
                maxWidth: 380,
                flexGrow: 1,
              }}
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
              link='/objects'
              field={field}
              options={objects}
              required
              error={error}
              style={{
                display: activeBookmark === 'profile' ? 'flex' : 'none',
                minWidth: 'calc(33.3% - 1rem)',
                maxWidth: 380,
                flexGrow: 1,
              }}
            />
          );
        }}
      />
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('name')}
        error={!!errors.name}
        label={<CustomLabel label={'Name'} required />}
        helperText={errors.name ? errors.name?.message : ''}
        className={mdDown ? 'mobile' : ''}
        disabled
        sx={{
          display: activeBookmark === 'profile' ? 'flex' : 'none',
          minWidth: 'calc(33.3% - 1rem)',
          '&.mobile': {
            width: 'auto',
            flex: '1',
          },
        }}
      />

      <Controller
        control={control}
        name='parentTaskTemplates'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={'Parent Tasks'}
            link='/task-templates'
            options={task_templates}
            value={value}
            error={error!}
            handleChange={onChange}
            style={{
              display: activeBookmark === 'profile' ? 'flex' : 'none',
              minWidth: 'calc(50% - .75rem)',
            }}
          />
        )}
      />

      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('cost')}
        error={!!errors.cost}
        label={<CustomLabel label={'Cost'} required={!isDraft} />}
        helperText={errors.cost ? errors.cost?.message : ''}
        className={mdDown ? 'mobile' : ''}
        sx={{
          display: activeBookmark === 'profile' ? 'flex' : 'none',
          minWidth: 'calc(33.3% - 1rem)',
          '&.mobile': {
            width: 'auto',
            flex: '1',
          },
        }}
      />

      <Controller
        name='frequency_id'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <CustomSingleSelect
            label='Frequency'
            link='/frequencies'
            required={!isDraft}
            field={field}
            options={frequencies}
            error={error}
            style={{
              display: activeBookmark === 'profile' ? 'flex' : 'none',
            }}
          />
        )}
      />

      <Controller
        control={control}
        name='professions'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/professions'
            options={professions}
            value={value}
            required={!isDraft}
            error={error!}
            handleChange={onChange}
            style={{
              display: activeBookmark === 'profile' ? 'flex' : 'none',
              minWidth: 'calc(50% - .75rem)',
            }}
          />
        )}
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
            required
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
          display: activeBookmark === 'step_templates' ? 'flex' : 'none',
          width: '100%',
        }}
        gap='1rem'
      >
        <Typography variant='h5' textAlign='center'>
          {getValues('name')}
        </Typography>
        <Typography
          textAlign='center'
          sx={{
            fontSize: '1.2rem',
          }}
        >
          Step Templates
        </Typography>
        <TaskTemplateSteps
          steps={steps}
          dispatch={dispatch}
          handleSetModal={handleSetModal}
          fullScreen={fullScreen}
          commonData={commonData}
          clearErrors={clearErrors}
          errors={errors['stepTemplates' as keyof typeof errors] ?? []}
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
