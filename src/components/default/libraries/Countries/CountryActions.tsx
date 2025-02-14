'use client';
import AddImage from '@/components/default/common/components/Addimage';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { Avatar, Stack, TextField, Theme, Typography, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomImageSelect from '../../common/form/CustomImageSelect/CustomImageSelect';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import { getActiveBookmark, getDisabledBookmark } from '../helpers/bookmarks';

type CountryFields = 'name' | 'iso2' | 'iso3' | 'latitude' | 'longitude' | 'description';

interface IFormInputs {
  name: string;
  iso2?: string;
  iso3?: string;
  image: string;
  status_id: number;
  library_id?: number | string;
  translation_id: number | string;
  priority_id: number;
  latitude: number | string;
  longitude: number | string;
  reason: string;
  image_icon: any;
  description: string;
}

interface ICountryActionsProps {
  id: number | null;
  visible: boolean;
  isProfile?: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

interface IChechRefetchData {
  isEdit: boolean;
  isVisible: boolean;
  isSimilar: boolean;
  isLibrarySelected: boolean;
}

interface ITranslatedCountryData {
  latitude: number;
  longitude: number;
  iso2: string;
  iso3: string;
  flag: string;
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

function TranslatedCountryData({ latitude, longitude, iso2, iso3, flag }: ITranslatedCountryData) {
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
      <Stack flexDirection='row' gap='.5rem' alignItems='flex-end'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          ISO2:
        </Typography>
        <Typography>{iso2}</Typography>
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='flex-end'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          ISO3:
        </Typography>
        <Typography>{iso3}</Typography>
      </Stack>
      <Stack flexDirection='row' gap='.5rem' alignItems='center'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Flag:
        </Typography>
        <Avatar src={flag ?? '/images/question_mark.svg'} alt='Flag' />
      </Stack>
    </Stack>
  );
}

export default function CountryActions({
  id,
  commonData,
  isProfile = false,
  isDuplicate = false,
  visible,
  handleActions,
}: ICountryActionsProps) {
  const editorRef = useRef<IEditor | null>(null);
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const showNotification = useNotification();
  const [fullScreen, setFullScreen] = useState(false);
  const {
    activeBookmark,
    changeActiveBookmark,
    toggleInteraction,
    toggleBookmarkError,
    bookmarks,
  } = useBookmarks(['group', 'translation', 'similar'], visible);
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const statuses = commonData.statuses ?? [];
  const languages = commonData.languages ?? [];
  const priorities = commonData.priorities ?? [];
  const libraries = commonData.groups ?? [];
  const libraries_similar = commonData.groups_similar ?? [];
  const flags = commonData.flags ?? [];

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
    setError,
    setValue,
    getValues,
    clearErrors,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      status_id: 1,
      library_id: '',
      priority_id: 1,
      translation_id: 1,
      description: '',
      image_icon: '',
      image: '',
      reason: '',
    },
  });

  const libraryId = watch('library_id');
  const translationId = watch('translation_id');
  const iso2 = watch('iso2')?.toLowerCase();

  const handleUpperCase = (e: any) => {
    const { name, value } = e.target;
    setValue(name, value.toUpperCase());
  };

  const clearData = () =>
    reset({
      name: '',
      iso2: '',
      iso3: '',
      status_id: 1,
      priority_id: 1,
      library_id: '',
      translation_id: 1,
      longitude: '',
      latitude: '',
      image: '',
      description: '',
      image_icon: '',
      reason: '',
    });

  const fullScreenHandler = () => setFullScreen(!fullScreen);
  const queryClient = useQueryClient();

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    changeActiveBookmark('group');
    queryClient.removeQueries({ queryKey: ['country-actions'] });
    queryClient.removeQueries({ queryKey: ['country-translation'] });
    handleActions(false);
    setCreationInfo(null);
    toggleInteraction();
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as CountryFields;
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
    mutationFn: (data: any) => apiSetData('countries', data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'country' : 'countries'],
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
    mutationFn: async (data: any) => apiUpdateData(`countries/${id}`, data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'country' : 'countries'],
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
    queryKey: ['country-actions', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`countries/${id ?? libraryId}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const { data: translatedData } = useQuery({
    queryKey: ['country-translation', id, libraryId, translationId],
    queryFn: async () => {
      try {
        const response = await apiGetData(`countries/${libraryId}?translation_id=${translationId}`);
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
      delete commonData.iso2;
      delete commonData.iso3;
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

  useEffect(() => {
    if (id && data) {
      const priorityName = data.priority.name;
      const translationISO = data.translation.iso2;
      const newActiveBookmark = getActiveBookmark(priorityName, translationISO);
      const disabledBookmark = getDisabledBookmark(newActiveBookmark);
      reset({
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        iso2: data?.iso2,
        iso3: data?.iso3,
        status_id: data?.status.id,
        priority_id: data?.priority.id,
        library_id: data?.library.id,
        translation_id: data?.translation?.language_id,
        image_icon: data?.image_icon,
        description: data.description,
        longitude: data?.longitude,
        latitude: data?.latitude,
        image: data?.image?.match(/\/flags.*/)[0],
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
  }, [id, visible, data]);

  useEffect(() => {
    if (!id && visible && data) {
      setValue('longitude', data?.longitude);
      setValue('latitude', data?.latitude);
      setValue('iso2', data?.iso2);
      setValue('iso3', data?.iso3);
      setValue('image', data?.image?.match(/\/flags.*/)[0]);
    }
  }, [data, visible, isDuplicate]);

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
        queryClient.removeQueries({ queryKey: ['country-translation'] });
        setValue('priority_id', 2);
        setValue('translation_id', 1);
      }
    }
  }, [id, activeBookmark]);

  return (
    <ActionsDrawer
      id={id}
      title='Country'
      visible={visible}
      isLoading={!!id && isFetching}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
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
                link='/countries'
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
              error={error}
              required
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
              disabled={activeBookmark !== 'translation'}
              required
              options={priorities}
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
          <TextField
            variant='standard'
            InputLabelProps={{ shrink: true }}
            {...register('latitude')}
            error={!!errors.latitude}
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
            {...register('longitude')}
            error={!!errors.latitude}
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
          <TextField
            variant='standard'
            InputLabelProps={{ shrink: true }}
            {...register('iso2')}
            error={!!errors.iso2}
            helperText={errors.iso2 ? errors.iso2?.message : ''}
            label={<CustomLabel label={'ISO2'} required={activeBookmark !== 'translation'} />}
            className={mdDown ? 'mobile' : ''}
            onChange={handleUpperCase}
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
            {...register('iso3')}
            error={!!errors.iso3}
            helperText={errors.iso3 ? errors.iso3?.message : ''}
            label={<CustomLabel label={'ISO3'} required={activeBookmark !== 'translation'} />}
            className={mdDown ? 'mobile' : ''}
            onChange={handleUpperCase}
            sx={{
              minWidth: 'calc(33.3% - 1rem)',
              '&.mobile': {
                width: 'auto',
                flex: '1',
              },
            }}
          />
          <Controller
            control={control}
            name='image'
            render={({ field: { onChange, value, name }, fieldState: { error } }) => (
              <CustomImageSelect
                type={name}
                options={flags}
                value={value}
                error={error!}
                tiedValue={{ iso2 }}
                label='Flags'
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                  flexGrow: 1,
                }}
                handleChange={onChange}
              />
            )}
          />
        </>
      )}

      {activeBookmark === 'translation' && (
        <TranslatedCountryData
          latitude={translatedData?.latitude}
          longitude={translatedData?.longitude}
          iso2={translatedData?.iso2}
          iso3={translatedData?.iso3}
          flag={translatedData?.image}
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
    </ActionsDrawer>
  );
}
