'use client';
import AddImage from '@/components/default/common/components/Addimage';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import useTranslateAI from '@/hooks/useTranslateAI';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { Stack, TextField, Theme, Typography, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import TranslationChip from '../../common/components/TranslationChip';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import GPTModal from '../../common/modals/GPTModal/GPTModal';
import { getActiveBookmark, getDisabledBookmark } from '../helpers/bookmarks';

type SubndustryFields =
  | 'name'
  | 'status_id'
  | 'library_id'
  | 'translation_id'
  | 'priority_id'
  | 'description'
  | 'industry_id';

interface IFormInputs {
  name: string;
  status_id: number | string;
  library_id?: number | string;
  translation_id: number | string;
  priority_id: number | string;
  industry_id: number | string;
  description: string;
  image_icon: any;
  reason: string;
}

interface ISubIndustryActionsProps {
  id: number | null;
  visible: boolean;
  isProfile?: boolean;
  isDuplicate?: boolean;
  commonData: ICommonData;
  handleActions: (visible: boolean, id?: number | null) => void;
}

interface IChechRefetchData {
  isEdit: boolean;
  isVisible: boolean;
  isSimilar: boolean;
  isLibrarySelected: boolean;
}

interface ITranslatedSubIndustryData {
  industry: IIndustry;
  translateLibrary: (libraryId?: number | string) => void;
}

function chechRefetchData({ isEdit, isVisible, isSimilar, isLibrarySelected }: IChechRefetchData) {
  if (isVisible) {
    if (isEdit && !isLibrarySelected) {
      return true;
    }
    if (!isEdit && isSimilar && isLibrarySelected) {
      return true;
    }
  }
  return false;
}

function TranslatedSubIndustryData({ industry, translateLibrary }: ITranslatedSubIndustryData) {
  return (
    <Stack gap='1rem'>
      <Stack flexDirection='row' gap='.5rem' alignItems='center'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Industry:
        </Typography>
        {industry && (
          <TranslationChip data={industry} click={() => translateLibrary(industry?.id)} />
        )}
      </Stack>
    </Stack>
  );
}

export default function SubIndustryActions({
  id,
  commonData,
  isProfile = false,
  isDuplicate = false,
  visible,
  handleActions,
}: ISubIndustryActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const editorRef = useRef<IEditor | null>(null);
  const [fullScreen, setFullScreen] = useState(false);

  const {
    activeBookmark,
    changeActiveBookmark,
    toggleInteraction,
    toggleBookmarkError,
    bookmarks,
  } = useBookmarks(['group', 'translation', 'similar'], visible);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const statuses = commonData.statuses ?? [];
  const languages = commonData.languages ?? [];
  const priorities = commonData.priorities ?? [];
  const libraries = commonData.groups ?? [];
  const libraries_similar = commonData.groups_similar ?? [];
  const industries = commonData.industries ?? [];

  const filteredLanguages = useMemo(() => {
    if (activeBookmark === 'translation') {
      return languages.filter((el) => el.id !== 1);
    }
    return languages;
  }, [languages, activeBookmark]);

  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);

  const {
    register,
    reset,
    control,
    watch,
    setError,
    setValue,
    getValues,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      status_id: '',
      library_id: '',
      priority_id: 1,
      translation_id: 1,
      industry_id: '',
      image_icon: '',
      description: '',
      reason: '',
    },
  });

  const clearData = () =>
    reset({
      name: '',
      status_id: '',
      translation_id: 1,
      library_id: '',
      priority_id: 1,
      industry_id: '',
      description: '',
      image_icon: '',
      reason: '',
    });

  const libraryId = watch('library_id');
  const translationId = watch('translation_id');

  const { gptModal, translationLoading, handleSaveLibrary, handleCloseGPT, translateLibrary } =
    useTranslateAI({ invalidationQueryKey: 'sub-industry-translation', translationId });

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const queryClient = useQueryClient();

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    changeActiveBookmark('group');
    queryClient.removeQueries({ queryKey: ['sub-industry-actions'] });
    queryClient.removeQueries({ queryKey: ['sub-industry-translation'] });
    toggleInteraction();
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as SubndustryFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
    toggleBookmarkError(activeBookmark);
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => apiSetData('sub-industries', data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'sub-industry' : 'sub-industries'],
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
    mutationFn: async (data: any) => apiUpdateData(`sub-industries/${id}`, data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'sub-industry' : 'sub-industries'],
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
    queryKey: ['sub-industry-actions', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`sub-industries/${id ?? libraryId}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const { data: translatedData } = useQuery({
    queryKey: ['sub-industry-translation', id, libraryId, translationId],
    queryFn: async () => {
      try {
        const response = await apiGetData(
          `sub-industries/${libraryId}?translation_id=${translationId}`
        );
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
    refetchOnWindowFocus: false,
    enabled: activeBookmark === 'translation' && !!libraryId && !!translationId,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
    };
    if (typeof commonData.image_icon === 'string') {
      delete commonData.image_icon;
    }
    if (activeBookmark === 'group') {
      delete commonData.library_id;
    }
    if (id && !isDuplicate) {
      updateMutation.mutate(commonData);
    } else {
      createMutation.mutate(commonData);
    }
  };

  const submitHandler = handleSubmit(onSubmit);

  const handleGPTModalClose = (data: string) => {
    handleSaveLibrary(data);
    handleCloseGPT();
  };

  const submitForm = (e: FormEvent) => {
    e.preventDefault();
    clearErrors();
    submitHandler();
  };

  useEffect(() => {
    if (id && data) {
      const priorityName = data.priority.name;
      const translationISO = data.translation.iso2;
      const newActiveBookmark = getActiveBookmark(priorityName, translationISO);
      const disabledBookmark = getDisabledBookmark(newActiveBookmark);
      reset({
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        status_id: data?.status.id,
        priority_id: data?.priority.id,
        library_id: data?.library.id,
        translation_id: data?.translation.id,
        image_icon: data?.image_icon,
        description: data.description,
        industry_id: data?.industry?.industry_id ?? '',
        reason: '',
      });
      setCreationInfo({
        created_at: data.created_at,
        created_by: data.created_by,
      });
      changeActiveBookmark(newActiveBookmark);
      toggleInteraction(disabledBookmark);
    } else {
      setValue(
        'status_id',
        (statuses.find((status) => status.is_default === 1)?.id as number) ?? ''
      );
    }
  }, [id, visible, data, isDuplicate]);

  useEffect(() => {
    if (!id && visible && data) {
      setValue('industry_id', data?.industry?.industry_id ?? '');
    }
  }, [data, visible]);

  useEffect(() => {
    if (
      chechRefetchData({
        isVisible: visible,
        isSimilar: activeBookmark === 'similar',
        isEdit: !!id,
        isLibrarySelected: !!libraryId,
      })
    ) {
      refetch();
    }
  }, [id, visible, libraryId]);

  useEffect(() => {
    if (!id) {
      if (activeBookmark === 'group') {
        clearData();
      }
      if (activeBookmark === 'translation') {
        setValue('translation_id', '');
      }
      if (activeBookmark === 'similar') {
        queryClient.removeQueries({ queryKey: ['sub-industry-translation'] });
        setValue('priority_id', 2);
        setValue('translation_id', 1);
      }
    }
  }, [id, activeBookmark]);

  return (
    <ActionsDrawer
      id={id}
      title='Sub Industry'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      isLoading={(!!id && isFetching) || translationLoading}
      hideHandler={hideHandler}
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
        {...register('name')}
        error={!!errors.name}
        label={<CustomLabel label={'Name'} required />}
        helperText={errors.name ? errors.name?.message : ''}
        className={mdDown ? 'mobile' : ''}
        sx={{
          minWidth: 'calc(50% - 1rem)',
          '&.mobile': {
            width: 'auto',
            flex: '1',
          },
        }}
      />

      {activeBookmark !== 'group' && (
        <Controller
          name='library_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Group'
                link='/sub-industries'
                field={field}
                options={activeBookmark === 'translation' ? libraries_similar : libraries}
                required={activeBookmark !== 'group'}
                error={error}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                }}
              />
            );
          }}
        />
      )}

      <Controller
        name='translation_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Translation'
              link='/languages'
              disabled={activeBookmark !== 'translation'}
              field={field}
              required={activeBookmark === 'translation'}
              options={filteredLanguages}
              error={error}
              style={{
                minWidth: 'calc(50% - 2rem)',
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
              field={field}
              options={statuses}
              error={error}
              required
              style={{
                minWidth: '100%',
                flexGrow: 1,
              }}
            />
          );
        }}
      />

      <Controller
        name='priority_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Priority'
              link='/priorities'
              disabled={activeBookmark !== 'translation'}
              required
              field={field}
              options={priorities}
              error={error}
              style={{
                minWidth: 'calc(50% - .5rem)',
              }}
            />
          );
        }}
      />

      {activeBookmark !== 'translation' && (
        <Controller
          name='industry_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Industry'
                link='/industries'
                field={field}
                options={industries}
                error={error}
                style={{
                  minWidth: 'calc(50% - 1rem)',
                }}
              />
            );
          }}
        />
      )}

      {activeBookmark === 'translation' && (
        <TranslatedSubIndustryData
          industry={translatedData?.industry}
          translateLibrary={translateLibrary}
        />
      )}

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
              width: '100%',
            }}
          />
        )}
      />

      <Controller
        control={control}
        name='image_icon'
        render={({ field: { onChange, value } }) => (
          <AddImage value={value} text={value ? 'Update image' : 'Add image'} onChange={onChange} />
        )}
      />
      <GPTModal
        open={gptModal.open}
        clear={!gptModal.open}
        answer={gptModal.answer}
        link={gptModal.link}
        thread_id={gptModal.thread_id}
        handleClose={handleGPTModalClose}
      />
    </ActionsDrawer>
  );
}
