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
import { Box, Stack, TextField, Theme, Typography, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import MoreChips from '../../common/components/MoreChips';
import ColorInput from '../../common/form/ColorInput/ColorInput';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import CustomSelect from '../../common/form/CustomSelect/CustomSelect';
import GPTModal from '../../common/modals/GPTModal/GPTModal';
import { getActiveBookmark, getDisabledBookmark } from '../helpers/bookmarks';
import { DepartmentFields, IDepartmentActionsProps, IFormInputs } from './types';

const getDefaultFormInputs = (): IFormInputs => ({
  name: '',
  status_id: 1,
  library_id: '',
  priority_id: 1,
  translation_id: 1,
  professions: [],
  links: [],
  color: '',
  description: '',
  image_icon: '',
  reason: '',
});

interface IChechRefetchData {
  isEdit: boolean;
  isVisible: boolean;
  isSimilar: boolean;
  isLibrarySelected: boolean;
}

interface ITranslatedDepartmentData {
  professions: IProfession[];
  links: ILink[];
  color: string;
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

function TranslatedDepartmentData({
  professions,
  links,
  color,
  translateLibrary,
}: ITranslatedDepartmentData) {
  return (
    <Stack gap='1rem'>
      <Stack flexDirection='row' gap='.5rem' alignItems='center'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Professions:
        </Typography>
        <MoreChips
          data={professions ?? []}
          propName='name'
          component='translation'
          click={translateLibrary}
        />
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='center'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Links:
        </Typography>
        <MoreChips
          data={links ?? []}
          propName='name'
          component='translation'
          click={translateLibrary}
        />
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='center'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Color:
        </Typography>
        <Stack flexDirection='row' gap='.5rem' alignItems='center'>
          <Box
            sx={{
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              bgcolor: color,
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}

export default function DepartmentActions({
  id,
  commonData,
  visible,
  isProfile = false,
  isDuplicate = false,
  handleActions,
}: IDepartmentActionsProps) {
  const editorRef = useRef<IEditor | null>(null);
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
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
  const professions = commonData.professions ?? [];
  const links = commonData.links ?? [];

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
    setValue,
    setError,
    getValues,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: getDefaultFormInputs(),
  });

  const libraryId = watch('library_id');
  const translationId = watch('translation_id');

  const { gptModal, translationLoading, handleSaveLibrary, handleCloseGPT, translateLibrary } =
    useTranslateAI({ invalidationQueryKey: 'department-translation', translationId });

  const clearData = () => reset(getDefaultFormInputs());

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const queryClient = useQueryClient();

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    changeActiveBookmark('group');
    queryClient.removeQueries({ queryKey: ['department-actions'] });
    queryClient.removeQueries({ queryKey: ['department-translation'] });
    toggleInteraction();
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as DepartmentFields;
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
    mutationFn: (data: any) => apiSetData('departments', data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'department' : 'departments'],
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
    mutationFn: async (data: any) => apiUpdateData(`departments/${id}`, data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'department' : 'departments'],
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
    queryKey: ['department-actions', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`departments/${id ?? libraryId}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const { data: translatedData } = useQuery({
    queryKey: ['department-translation', id, libraryId, translationId],
    queryFn: async () => {
      try {
        const response = await apiGetData(
          `departments/${libraryId}?translation_id=${translationId}`
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
    if (activeBookmark === 'translation') {
      delete commonData.color;
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
        translation_id: data?.translation?.language_id,
        image_icon: data?.image_icon,
        description: data.description,
        professions: data?.professions.map((profession: IProfession) => profession.profession_id),
        links: data?.links?.map((el: ILink) => el.id),
        color: data?.color,
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
      setValue(
        'professions',
        data?.professions.map((profession: IProfession) => profession.profession_id)
      );
      setValue(
        'links',
        data?.links?.map((el: ILink) => el.id)
      );
      setValue('color', data?.color);
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
        queryClient.removeQueries({ queryKey: ['department-translation'] });
        setValue('priority_id', 2);
        setValue('translation_id', 1);
      }
    }
  }, [id, activeBookmark]);

  return (
    <ActionsDrawer
      id={id}
      title='Department'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      hideHandler={hideHandler}
      isLoading={(!!id && isFetching) || translationLoading}
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

      {activeBookmark !== 'group' && (
        <Controller
          name='library_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Group'
                link='/departments'
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
              field={field}
              options={filteredLanguages}
              disabled={activeBookmark !== 'translation'}
              required={activeBookmark === 'translation'}
              error={error}
              style={{
                minWidth: 'calc(33.3% - 1rem)',
                maxWidth: 380,
                flexGrow: 1,
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
              required
              error={error}
              style={{
                minWidth: 'calc(33.3% - 1rem)',
                maxWidth: 380,
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
              field={field}
              options={priorities}
              disabled={activeBookmark !== 'translation'}
              required
              error={error}
              style={{
                minWidth: 'calc(33.3% - 1rem)',
                maxWidth: 380,
                flexGrow: 1,
              }}
            />
          );
        }}
      />

      {activeBookmark !== 'translation' && (
        <>
          <Controller
            control={control}
            name='professions'
            render={({ field: { onChange, value, name }, fieldState: { error } }) => (
              <CustomSelect
                type={name}
                disabled={activeBookmark === 'translation'}
                link='/professions'
                options={professions}
                value={value}
                error={error!}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                  maxWidth: 380,
                }}
                handleChange={onChange}
              />
            )}
          />

          <Controller
            control={control}
            name='links'
            render={({ field: { onChange, value, name }, fieldState: { error } }) => (
              <CustomSelect
                type={name}
                disabled={activeBookmark === 'translation'}
                link='/links'
                options={links}
                value={value}
                error={error!}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                  maxWidth: 380,
                }}
                handleChange={onChange}
              />
            )}
          />
          <Controller
            control={control}
            name='professions'
            render={() => (
              <Controller
                disabled={activeBookmark === 'translation'}
                name='color'
                control={control}
                render={({ field }) => (
                  <ColorInput field={field} error={errors.color} label='Color' />
                )}
              />
            )}
          />
        </>
      )}

      {activeBookmark === 'translation' && (
        <TranslatedDepartmentData
          color={translatedData?.color}
          links={translatedData?.links}
          professions={translatedData?.professions}
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
