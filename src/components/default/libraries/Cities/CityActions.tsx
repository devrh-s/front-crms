'use client';
import AddImage from '@/components/default/common/components/Addimage';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
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
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import GPTModal from '../../common/modals/GPTModal/GPTModal';
import { getActiveBookmark, getDisabledBookmark } from '../helpers/bookmarks';

type CityFields = 'name' | 'country_id' | 'latitude' | 'longitude' | 'description';
interface IFormInputs {
  name: string;
  country_id: number;
  status_id: number;
  library_id?: number | string;
  translation_id: number | string;
  priority_id: number;
  latitude: number | string;
  longitude: number | string;
  reason: string;
  description: string;
  image_icon: any;
}

interface ICityActionsProps {
  id: number | null;
  visible: boolean;
  commonData: ICommonData;
  isProfile?: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

interface IChechRefetchData {
  isEdit: boolean;
  isVisible: boolean;
  isSimilar: boolean;
  isLibrarySelected: boolean;
}

interface ITranslatedCityData {
  latitude: number;
  longitude: number;
  country: {
    name: string;
    image: string;
    library_id: string;
    is_translated: boolean;
  };
  translateLibrary: (libraryId: number | string) => void;
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

function TranslatedCityData({
  latitude,
  longitude,
  country,
  translateLibrary,
}: ITranslatedCityData) {
  return (
    <Stack gap='1rem'>
      <Stack flexDirection='row' gap='.5rem' alignItems='flex-end'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Latitude:
        </Typography>
        <Typography>{latitude}</Typography>
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='flex-end'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Longitude:
        </Typography>
        <Typography>{longitude}</Typography>
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='center'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Country:
        </Typography>
        {country?.name && (
          <TranslationChip
            data={{ ...country, image: country.image ?? '/images/question_mark.svg' }}
            click={() => translateLibrary(country?.library_id)}
          />
        )}
      </Stack>
    </Stack>
  );
}

export default function CityActions({
  id,
  commonData,
  isProfile = false,
  isDuplicate = false,
  visible,
  handleActions,
}: ICityActionsProps) {
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
  const countries = commonData.countries ?? [];
  const statuses = commonData.statuses ?? [];
  const languages = commonData.languages ?? [];
  const priorities = commonData.priorities ?? [];
  const libraries = commonData.groups ?? [];
  const libraries_similar = commonData.groups_similar ?? [];
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);

  const filteredLanguages = useMemo(() => {
    if (activeBookmark === 'translation') {
      return languages.filter((el) => el.id !== 1);
    }
    return languages;
  }, [languages, activeBookmark]);

  const {
    register,
    reset,
    control,
    watch,
    clearErrors,
    setValue,
    getValues,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      status_id: 1,
      country_id: 1,
      library_id: '',
      priority_id: 1,
      translation_id: 1,
      description: '',
      image_icon: '',
      reason: '',
    },
  });

  const clearData = () =>
    reset({
      name: '',
      country_id: 1,
      status_id: 1,
      priority_id: 1,
      library_id: '',
      translation_id: 1,
      longitude: '',
      latitude: '',
      description: '',
      image_icon: '',
      reason: '',
    });

  const libraryId = watch('library_id');
  const translationId = watch('translation_id');

  const { gptModal, translationLoading, handleSaveLibrary, handleCloseGPT, translateLibrary } =
    useTranslateAI({ invalidationQueryKey: 'city-translation', translationId });

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    changeActiveBookmark('group');
    queryClient.removeQueries({ queryKey: ['city-actions'] });
    queryClient.removeQueries({ queryKey: ['city-translation'] });
    toggleInteraction();
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as CityFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
    toggleBookmarkError(activeBookmark);
  };

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => apiSetData('cities', data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'city' : 'cities'],
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
    mutationFn: async (data: any) => apiUpdateData(`cities/${id}`, data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'city' : 'cities'],
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
    queryKey: ['city-actions', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`cities/${id ?? libraryId}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const { data: translatedData } = useQuery({
    queryKey: ['city-translation', id, libraryId, translationId],
    queryFn: async () => {
      try {
        const response = await apiGetData(`cities/${libraryId}?translation_id=${translationId}`);
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
        country_id: data?.country?.country_id,
        status_id: data?.status?.id,
        priority_id: data?.priority.id,
        library_id: data?.library.id,
        translation_id: data?.translation?.language_id,
        image_icon: data?.image_icon,
        description: data.description,
        longitude: data?.longitude,
        latitude: data?.latitude,
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
      setValue('country_id', data?.country?.country_id);
      setValue('longitude', data?.longitude);
      setValue('latitude', data?.latitude);
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
        queryClient.removeQueries({ queryKey: ['city-translation'] });
        setValue('priority_id', 2);
        setValue('translation_id', 1);
      }
    }
  }, [id, activeBookmark]);

  return (
    <ActionsDrawer
      id={id}
      title='City'
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
                link='/cities'
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
              required={activeBookmark === 'translation'}
              disabled={activeBookmark !== 'translation'}
              options={filteredLanguages}
              error={error}
              style={{
                minWidth: 'calc(33.3% - 1rem)',
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
              required
              label='Status'
              link='/statuses'
              field={field}
              options={statuses}
              error={error}
              style={{
                minWidth: 'calc(33.3% - 1rem)',
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
              disabled={activeBookmark !== 'translation'}
              required
              options={priorities}
              error={error}
              style={{
                minWidth: 'calc(33.3% - 1rem)',
              }}
            />
          );
        }}
      />

      {activeBookmark !== 'translation' && (
        <>
          <TextField
            variant='standard'
            InputLabelProps={{ shrink: true }}
            {...register('latitude')}
            error={!!errors.latitude}
            disabled={activeBookmark === 'translation'}
            helperText={errors.latitude ? errors.latitude?.message : ''}
            label='Latitude'
            className={mdDown ? 'mobile' : ''}
            sx={{
              minWidth: 'calc(33.3% - 1rem)',
              '&.mobile': {
                width: 'auto',
                flex: '1',
              },
            }}
          />

          <TextField
            variant='standard'
            InputLabelProps={{ shrink: true }}
            disabled={activeBookmark === 'translation'}
            {...register('longitude')}
            error={!!errors.longitude}
            helperText={errors.longitude ? errors.longitude?.message : ''}
            label='Longitude'
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
            name='country_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Country Name'
                  link='/countries'
                  field={field}
                  disabled={activeBookmark === 'translation'}
                  options={countries}
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
        </>
      )}

      {activeBookmark === 'translation' && (
        <TranslatedCityData
          latitude={translatedData?.latitude}
          longitude={translatedData?.longitude}
          translateLibrary={translateLibrary}
          country={{
            name: translatedData?.country?.name,
            image: translatedData?.country?.image,
            library_id: translatedData?.country?.library_id,
            is_translated: !!translatedData?.country?.is_translated,
          }}
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
