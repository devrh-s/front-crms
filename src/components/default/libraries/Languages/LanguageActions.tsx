'use client';
import AddImage from '@/components/default/common/components/Addimage';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { TextField, Theme, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import ActionsDrawer from '../../common/drawers/ActionsDrawer/ActionsDrawer';
import CustomImageSelect from '../../common/form/CustomImageSelect/CustomImageSelect';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import { getActiveBookmark, getDisabledBookmark } from '../helpers/bookmarks';

type LanguageFields = 'name' | 'iso2' | 'iso3' | 'description';

interface IFormInputs {
  name: string;
  iso2?: string;
  iso3?: string;
  image: string;
  status_id: number;
  library_id?: number | string;
  translation_id: number | string;
  priority_id: number;
  description: string;
  image_icon: any;
  reason: string;
}

interface ILanguageActionsProps {
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

export default function LanguageActions({
  id,
  commonData,
  visible,
  isProfile = false,
  isDuplicate = false,
  handleActions,
}: ILanguageActionsProps) {
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
  const priorities = commonData.priorities ?? [];
  const libraries = commonData.groups ?? [];
  const libraries_similar = commonData.groups_similar ?? [];
  const languages = commonData.languages ?? [];
  const flags = commonData.flags ?? [];

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
    getValues,
    setError,
    clearErrors,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      status_id: 1,
      library_id: '',
      priority_id: 1,
      translation_id: 1,
      image: '',
      image_icon: '',
      description: '',
      reason: '',
    },
  });

  const libraryId = watch('library_id');

  const iso2 = watch('iso2')?.toLowerCase();

  const clearData = () =>
    reset({
      name: '',
      iso2: '',
      iso3: '',
      status_id: 1,
      priority_id: 1,
      library_id: '',
      translation_id: 1,
      description: '',
      image_icon: '',
      image: '',
      reason: '',
    });

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const handleUpperCase = (e: any) => {
    const { name, value } = e.target;
    setValue(name, value.toUpperCase());
  };
  const queryClient = useQueryClient();
  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    changeActiveBookmark('group');
    queryClient.removeQueries({ queryKey: ['language-actions'] });
    toggleInteraction();
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as LanguageFields;
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
    mutationFn: (data: any) => apiSetData('languages', data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'language' : 'languages'],
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
    mutationFn: async (data: any) => apiUpdateData(`languages/${id}`, data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'language' : 'languages'],
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
    queryKey: ['language-actions', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`languages/${id ?? libraryId}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
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
    } else if (activeBookmark === 'translation') {
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
        iso2: data.iso2,
        iso3: data.iso3,
        status_id: data.status.id,
        priority_id: data.priority.id,
        library_id: data.library.id,
        translation_id: data.translation?.language_id,
        image_icon: data?.image_icon,
        description: data.description,
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
  }, [id, visible, data, isDuplicate]);

  useEffect(() => {
    if (!id && visible && data) {
      setValue('iso2', data?.iso2);
      setValue('iso3', data?.iso3);
      setValue('image', data?.image?.match(/\/flags.*/)[0]);
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
        setValue('priority_id', 2);
        setValue('translation_id', 1);
      }
    }
  }, [id, activeBookmark]);

  return (
    <ActionsDrawer
      id={id}
      title='Language'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      isLoading={!!id && isFetching}
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
                link='/languages'
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
              disabled={activeBookmark !== 'translation'}
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
              required
              options={statuses}
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

      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('iso2')}
        error={!!errors.iso2}
        disabled={activeBookmark === 'translation'}
        label={<CustomLabel label={'ISO2'} required={activeBookmark !== 'translation'} />}
        helperText={errors.iso2 ? errors.iso2?.message : ''}
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
        label={<CustomLabel label={'ISO3'} required={activeBookmark !== 'translation'} />}
        error={!!errors.iso3}
        disabled={activeBookmark === 'translation'}
        helperText={errors.iso3 ? errors.iso3?.message : ''}
        onChange={handleUpperCase}
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
        control={control}
        name='image'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomImageSelect
            type={name}
            options={flags}
            value={value}
            error={error!}
            disabled={activeBookmark === 'translation'}
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
