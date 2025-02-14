'use client';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import useBookmarks from '@/hooks/useBookmarks';
import useGenerateAI from '@/hooks/useGenerateAI';
import useNotification from '@/hooks/useNotification';
import useTranslateAI from '@/hooks/useTranslateAI';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { generateSearchParams } from '@/lib/helpers';
import { Stack, TextField, Theme, Typography, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import AiButton from '../../common/components/AiButton';
import MoreChips from '../../common/components/MoreChips';
import TranslationChip from '../../common/components/TranslationChip';
import ActionsDrawer from '../../common/drawers/ActionsDrawer/ActionsDrawer';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import GPTModal from '../../common/modals/GPTModal/GPTModal';

type PlacementTypeFields =
  | 'title'
  | 'job_template_id'
  | 'full_post_template'
  | 'destination'
  | 'status_id'
  | 'role_overview'
  | 'prompt';

interface IFormInputs {
  title: string;
  full_post_template: string;
  translation_id: string | number;
  destination: string;
  job_template_id: number | string;
  status_id: number | string;
  reason: string;
  role_overview: string;
  prompt: string;
}

interface ICityActionsProps {
  id: number | null;
  visible: boolean;
  commonData?: ICommonData;
  isProfile?: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

const initialValue = {
  title: '',
  full_post_template: '',
  translation_id: '',
  status_id: '',
  destination: '',
  reason: '',
  job_template_id: '',
  role_overview: '',
  prompt: '',
};

interface ITranslatedPostTemplateData {
  profession: IProfession;
  similar_profession: IProfession;
  task_templates: ITaskTemplate[];
  languages: ILanguage[];
  objects: IObject[];
  tools: ITool[];
  translateLibrary: (libraryId?: number | string) => void;
}

function TranslatedPostTemplateData({
  profession,
  languages,
  objects,
  tools,
  task_templates,
  similar_profession,
  translateLibrary,
}: ITranslatedPostTemplateData) {
  return (
    <Stack gap='1rem'>
      <Stack flexDirection='row' gap='.5rem' alignItems='center'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Profession:
        </Typography>
        {profession && (
          <TranslationChip data={profession} click={() => translateLibrary(profession?.id)} />
        )}
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='center'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Similar profession:
        </Typography>
        {similar_profession && (
          <TranslationChip
            data={similar_profession}
            click={() => translateLibrary(similar_profession?.library_id)}
          />
        )}
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='center'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Languages:
        </Typography>
        <MoreChips
          data={languages ?? []}
          propName='name'
          component='translation'
          click={translateLibrary}
        />
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='center'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Objects:
        </Typography>
        <MoreChips
          data={objects ?? []}
          propName='name'
          component='translation'
          click={translateLibrary}
        />
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='center'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Task Templates:
        </Typography>
        <MoreChips
          data={task_templates ?? []}
          propName='name'
          component='translation'
          click={translateLibrary}
        />
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='center'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Tools:
        </Typography>
        <MoreChips
          data={tools ?? []}
          propName='name'
          component='translation'
          click={translateLibrary}
        />
      </Stack>
    </Stack>
  );
}

export default function PostTemplatesActions({
  id,
  commonData,
  isProfile = false,
  visible,
  isDuplicate = false,
  handleActions,
}: ICityActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  // const [roleOverview, setRoleOverview] = useState('');
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    false
  );
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const editorNoteRef = useRef<IEditor | null>(null);
  const editorPostRef = useRef<IEditor | null>(null);
  const languages = commonData?.languages ?? [];

  const {
    register,
    reset,
    clearErrors,
    setError,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: initialValue,
  });

  const jobTemplateId = watch('job_template_id');
  const translationId = watch('translation_id');
  const roleOverview = watch('role_overview');

  const {
    gptModal: gptTranslationModal,
    translationLoading,
    handleSaveLibrary,
    handleCloseGPT,
    translateLibrary,
  } = useTranslateAI({ invalidationQueryKey: 'post-translation', translationId });

  const clearData = () => reset(initialValue);

  const job_templates = commonData?.job_templates ?? [];
  const statuses = commonData?.statuses ?? [];
  const destinations = commonData?.destinations ?? [];

  const titleInput = watch('title');
  const translationInput = watch('translation_id');
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
      const errorKey = key as PlacementTypeFields;
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
    mutationFn: (data: any) => apiSetData('post-templates', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'post-template' : 'post-templates'],
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
    mutationFn: async (data: any) => apiUpdateData(`post-templates/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'post-template' : 'post-templates'],
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
    queryKey: ['post-templates', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`post-templates/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const { data: translatedData } = useQuery({
    queryKey: ['post-translation', jobTemplateId, translationId],
    queryFn: async () => {
      try {
        const response = await apiGetData(
          `job-templates/${jobTemplateId}?translation_id=${translationId}`
        );
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
    refetchOnWindowFocus: false,
    enabled: !!jobTemplateId && !!translationId,
  });

  const translatedLanguages =
    translatedData?.languages?.map((elem: ILanguage) => elem?.language_id) ?? [];
  const translatedObjects = translatedData?.objects?.map((elem: IObject) => elem?.object_id) ?? [];
  const translatedTaskTemplates =
    translatedData?.task_templates?.map((elem: ITaskTemplate) => elem?.id) ?? [];
  const translatedTools = translatedData?.tools?.map((elem: ITool) => elem?.id) ?? [];

  useQuery({
    queryKey: ['job-template-prompt', { titleInput, translatedData }],
    queryFn: async () => {
      try {
        const queryParams = {
          translation_id: translationInput,
          title: titleInput,
          profession_id: translatedData?.profession?.profession_id ?? '',
          similar_profession_id: translatedData?.similar_profession_id ?? '',
          languages: translatedLanguages,
          objects: translatedObjects,
          task_templates: translatedTaskTemplates,
          tools: translatedTools,
        };
        const params = generateSearchParams(queryParams);

        const response = await apiGetData(`job-template-prompt?${params.toString()}`);
        setValue('prompt', response.data);
        clearErrors();
        return response.data;
      } catch (error) {
        setValue('prompt', '');
        console.error(error);
      }
    },
    refetchOnWindowFocus: false,
    enabled: !!translatedData,
  });

  const {
    gptModal: gptModalOverview,
    responseGenerating: overviewGenerating,
    handleCloseGPT: handleCloseOverviewGpt,
    generateResponse: generateOverview,
  } = useGenerateAI({
    url: 'openai/role-overview-translation',
  });

  const {
    gptModal: gptModalFullPost,
    responseGenerating: fullPostGenerating,
    handleCloseGPT: handleCloseFullPostGpt,
    generateResponse: generateFullPost,
  } = useGenerateAI({
    url: 'openai/post-template',
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
      prompt: data.prompt + stripHtmlTags(editorNoteRef.current?.getContent() as string),
      role_overview: editorNoteRef.current?.getContent(),
      full_post_template: editorPostRef.current?.getContent(),
    };
    if (id && !isDuplicate) {
      updateMutation.mutate(commonData);
    } else {
      createMutation.mutate(commonData);
    }
  };

  function stripHtmlTags(htmlString: string) {
    return htmlString?.length > 0 ? htmlString.replace(/<\/?[^>]+(>|$)/g, '') : '';
  }

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
        destination: data?.destination,
        full_post_template: data?.full_post_template,
        status_id: data.status.id,
        job_template_id: data.job_template?.id,
        translation_id: data.translation?.language_id,
        role_overview: data.role_overview,
        prompt: data.prompt,
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
      title='Post Template'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      isLoading={(!!id && isFetching) || translationLoading}
      hideHandler={hideHandler}
      resetHandler={clearData}
      submitForm={submitForm}
      changeActiveBookmark={changeActiveBookmark}
      toggleBookmarkError={toggleBookmarkError}
      fullScreenHandler={fullScreenHandler}
      fullScreen={fullScreen}
      register={register}
      errors={errors}
      isDuplicate={isDuplicate}
    >
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('title')}
        label={<CustomLabel label={'Title'} required />}
        error={!!errors.title}
        helperText={errors.title ? errors.title?.message : ''}
        className={mdDown ? 'mobile' : ''}
        sx={{
          minWidth: '100%',
          '&.mobile': {
            width: 'auto',
            flex: '1',
          },
        }}
      />
      <Controller
        name='job_template_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Job Templates'
              link='/job-templates'
              field={field}
              required
              options={job_templates}
              error={error}
              style={{
                minWidth: 'calc(50% - .75rem)',
              }}
            />
          );
        }}
      />
      <Controller
        name='translation_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Translation'
              link='/languages'
              field={field}
              options={languages}
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
        name='status_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Status'
              link='/statuses'
              required
              field={field}
              options={statuses}
              error={error}
              style={{
                minWidth: 'calc(50% - .75rem)',
              }}
            />
          );
        }}
      />
      <Controller
        name='destination'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Destination'
              required
              field={field}
              options={destinations}
              error={error}
              style={{
                minWidth: 'calc(50% - .75rem)',
              }}
            />
          );
        }}
      />

      <TranslatedPostTemplateData
        profession={translatedData?.profession}
        similar_profession={translatedData?.similar_profession}
        languages={translatedData?.languages}
        objects={translatedData?.objects}
        tools={translatedData?.tools}
        task_templates={translatedData?.task_templates}
        translateLibrary={translateLibrary}
      />

      <TextField
        variant='standard'
        inputProps={{ readOnly: true }}
        InputLabelProps={{ shrink: true }}
        {...register('prompt')}
        error={!!errors.prompt}
        helperText={errors.prompt ? errors.prompt?.message : ''}
        label={<CustomLabel label={'Prompt'} required />}
        className={mdDown ? 'mobile' : ''}
        sx={{
          minWidth: '100%',
        }}
        multiline
      />

      <AiButton
        buttonText={'Role Overview'}
        isMobile={mdDown}
        isFullScreen={fullScreen}
        isLoading={overviewGenerating}
        data={{ job_template_id: jobTemplateId, translation_id: translationId }}
        validationData={{ 'job template': !!jobTemplateId, translation: !!translationId }}
        generateResponse={generateOverview}
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
            title={'Role overview'}
            error={error?.message}
            style={{
              display: activeBookmark === 'profile' ? 'flex' : 'none',
              width: '100%',
            }}
          />
        )}
      />

      <AiButton
        buttonText={'Full Post'}
        isMobile={mdDown}
        isFullScreen={fullScreen}
        isLoading={fullPostGenerating}
        data={{
          translation_id: translationId,
          role_overview: roleOverview,
          languages: translatedLanguages,
          objects: translatedObjects,
          task_templates: translatedTaskTemplates,
          tools: translatedTools,
        }}
        validationData={{
          'role overview': !!roleOverview,
          languages: !!translatedLanguages?.length,
          objects: !!translatedObjects?.length,
          task_templates: !!translatedTaskTemplates?.length,
          tools: !!translatedTools?.length,
          translation: !!translationId,
        }}
        generateResponse={generateFullPost}
      />

      <Controller
        control={control}
        name='full_post_template'
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <CustomTextEditor
            ref={editorPostRef}
            value={value}
            fullScreen={fullScreen}
            height={fullScreen ? 500 : 150}
            onEditorChange={onChange}
            title={'full post template'}
            error={error?.message}
            style={{
              display: activeBookmark === 'profile' ? 'flex' : 'none',
              width: '100%',
            }}
          />
        )}
      />

      <GPTModal
        open={gptTranslationModal.open}
        clear={!gptTranslationModal.open}
        answer={gptTranslationModal.answer}
        link={gptTranslationModal.link}
        thread_id={gptTranslationModal.thread_id}
        handleClose={(data: string) => {
          handleSaveLibrary(data);
          handleCloseGPT();
        }}
      />

      <GPTModal
        open={gptModalOverview.open}
        clear={!gptModalOverview.open}
        answer={gptModalOverview.answer}
        link={gptModalOverview.link}
        thread_id={gptModalOverview.thread_id}
        handleClose={(data: string) => {
          setValue('role_overview', data);
          handleCloseOverviewGpt();
        }}
      />

      <GPTModal
        open={gptModalFullPost.open}
        clear={!gptModalFullPost.open}
        answer={gptModalFullPost.answer}
        link={gptModalFullPost.link}
        thread_id={gptModalFullPost.thread_id}
        handleClose={(data: string) => {
          setValue('full_post_template', data);
          handleCloseFullPostGpt();
        }}
      />
    </ActionsDrawer>
  );
}
