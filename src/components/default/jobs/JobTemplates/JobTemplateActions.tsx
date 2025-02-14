'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomSelect from '@/components/default/common/form/CustomSelect/CustomSelect';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import useBookmarks from '@/hooks/useBookmarks';
import useGenerateAI from '@/hooks/useGenerateAI';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { TextField, Theme, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import AiButton from '../../common/components/AiButton';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import GPTModal from '../../common/modals/GPTModal/GPTModal';
import SimilarProfessions from '../../common/related/actions/SimilarProfessions/SimilarProfessions';

interface IFormInputs {
  title: string;
  role_overview: string;
  status_id: string | number;
  profession_id: string | number;
  similar_profession_id: string | number;
  languages: number[];
  objects: number[];
  task_templates: number[];
  tools: number[];
  job_requests: number[];
  reason: string;
}

interface IJobTemplateActionsProps {
  id: number | null;
  visible: boolean;
  isProfile?: boolean;
  url?: string;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

const initialValue = {
  title: '',
  description: '',
  role_overview: '',
  full_template: '',
  status_id: '',
  similar_profession_id: '',
  profession_id: '',
  languages: [],
  objects: [],
  task_templates: [],
  tools: [],
  job_requests: [],
  reason: '',
};

export default function JobTemplateActions({
  id,
  commonData,
  url,
  isProfile = false,
  isDuplicate = false,
  visible,
  handleActions,
}: IJobTemplateActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );
  const { gptModal, responseGenerating, handleCloseGPT, generateResponse } = useGenerateAI({
    url: 'openai/role-overview',
  });

  const editorNoteRef = useRef<IEditor | null>(null);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const professions = commonData?.professions ?? [];
  const similar_professions = (commonData?.similar_professions as any) ?? [];
  const tools = commonData?.tools ?? [];
  const job_requests = commonData?.job_requests ?? [];
  const languages = commonData?.languages ?? [];
  const task_templates = commonData?.task_templates ?? [];
  const objects = commonData?.objects ?? [];
  const statuses = commonData?.statuses ?? [];
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);

  const {
    register,
    reset,
    control,
    watch,
    setValue,
    getValues,
    setError,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<IFormInputs>();
  const professionId = watch('profession_id');
  const similarProfessionId = watch('similar_profession_id');
  const languagesIds = watch('languages');
  const objectsIds = watch('objects');
  const toolsIds = watch('tools');
  const taskTemplatesIds = watch('task_templates');
  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const clearData = () => reset(initialValue);

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: Record<string, string[]>, status: number) => {
    const groupedErrors: Record<string, string[]> = {};

    for (const [key, messages] of Object.entries(errors)) {
      const baseKey = key.split('.')[0];

      if (!groupedErrors[baseKey]) {
        groupedErrors[baseKey] = [];
      }
      groupedErrors[baseKey].push(...messages);
    }

    for (const [field, messages] of Object.entries(groupedErrors)) {
      const errorMessage = messages.join('; ');
      setError(field as keyof IFormInputs, { message: errorMessage });
      showNotification(`${status}: ${errorMessage}`, 'error');
    }

    toggleBookmarkError('profile');
  };

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => apiSetData(url ?? 'job-templates', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'job-template' : (url ?? 'job-templates')],
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
    mutationFn: async (data: any) =>
      apiUpdateData(url ? `${url}/${id}` : `job-templates/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'job-template' : (url ?? 'job-templates')],
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
    queryKey: ['job-template', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(url ? `${url}/${id}` : `job-templates/${id}`);
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
        title: `${isDuplicate ? `${data?.title} COPY` : data?.title}`,
        role_overview: data.role_overview,
        status_id: data.status.id,
        profession_id: data.profession.profession_id,
        similar_profession_id: data.similar_profession?.profession_id,
        languages: data.languages.map((language: ILanguage) => language?.language_id),
        objects: data.objects.map((object: IObject) => object.object_id),
        task_templates: data.task_templates.map((task_template: ITaskTemplate) => task_template.id),
        tools: data.tools.map((tool: ITool) => tool.id),
        job_requests: data.job_requests.map((job: IJobRequestType) => job.id),
        reason: '',
      });
      setCreationInfo({
        created_at: data.created_at,
        created_by: data.created_by,
      });
    } else {
      setValue(
        'status_id',
        (statuses.find((status) => status.is_default === 1)?.id as number) ?? ''
      );
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
      title='Job Template'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      hideHandler={hideHandler}
      resetHandler={clearData}
      submitForm={submitForm}
      fullScreen={fullScreen}
      isLoading={isFetching}
      fullScreenHandler={fullScreenHandler}
      changeActiveBookmark={changeActiveBookmark}
      toggleBookmarkError={toggleBookmarkError}
      register={register}
      errors={errors}
      isDuplicate={isDuplicate}
    >
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('title')}
        error={!!errors.title}
        label={<CustomLabel label={'Title'} required />}
        helperText={errors.title ? errors.title?.message : ''}
        className={mdDown ? 'mobile' : ''}
        sx={{
          flexGrow: 1,
          minWidth: 'calc(50% - .75rem)',
        }}
      />
      <SimilarProfessions
        control={control}
        professions={professions}
        similar_professions={similar_professions}
        watch={watch}
        setValue={setValue}
      />

      <Controller
        name='status_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Status'
              link='/statuses'
              field={field}
              options={statuses}
              required
              error={error}
              style={{
                minWidth: 'calc(50% - .75rem)',
              }}
            />
          );
        }}
      />

      <Controller
        control={control}
        name='languages'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/languages'
            options={languages}
            value={value}
            error={error!}
            required
            style={{
              minWidth: 'calc(50% - .75rem)',
            }}
            handleChange={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name='objects'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/objects'
            options={objects}
            value={value}
            error={error!}
            style={{
              minWidth: 'calc(50% - .75rem)',
            }}
            handleChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name='task_templates'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/task-templates'
            options={task_templates}
            value={value}
            error={error!}
            required
            style={{
              minWidth: 'calc(50% - .75rem)',
            }}
            handleChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name='tools'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/tools'
            options={tools}
            value={value}
            required
            error={error!}
            style={{
              minWidth: 'calc(50% - .75rem)',
            }}
            handleChange={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name='job_requests'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/job-requests'
            options={job_requests}
            value={value}
            error={error!}
            style={{
              minWidth: 'calc(50% - .75rem)',
            }}
            handleChange={onChange}
          />
        )}
      />

      <AiButton
        buttonText={'Role Overview'}
        isMobile={mdDown}
        isFullScreen={fullScreen}
        isLoading={responseGenerating}
        data={{
          profession_id: professionId,
          similar_profession_id: similarProfessionId,
          languages: languagesIds,
          objects: objectsIds,
          task_templates: taskTemplatesIds,
          tools: toolsIds,
        }}
        validationData={{
          'profession or similar profession': !!professionId || !!similarProfessionId,
          languages: !!languagesIds?.length,
          objects: !!objectsIds?.length,
          'task templates': !!taskTemplatesIds?.length,
          tools: !!toolsIds?.length,
        }}
        generateResponse={generateResponse}
      />

      <Controller
        control={control}
        name='role_overview'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomTextEditor
            ref={editorNoteRef}
            value={value}
            fullScreen={fullScreen}
            height={fullScreen ? 500 : 150}
            onEditorChange={onChange}
            title={'role overview'}
            error={error?.message}
            style={{
              display: activeBookmark === 'profile' ? 'flex' : 'none',
              width: '100%',
            }}
          />
        )}
      />

      <GPTModal
        open={gptModal.open}
        clear={!gptModal.open}
        answer={gptModal.answer}
        link={gptModal.link}
        thread_id={gptModal.thread_id}
        handleClose={(data: string) => {
          setValue('role_overview', data);
          handleCloseGPT();
        }}
      />
    </ActionsDrawer>
  );
}
