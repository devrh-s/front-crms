'use client';
import AddImage from '@/components/default/common/components/Addimage';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import useBookmarks, { BookmarkName } from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import useTranslateAI from '@/hooks/useTranslateAI';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { Stack, TextField, Theme, Typography, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import MoreChips from '../../common/components/MoreChips';
import TranslationChip from '../../common/components/TranslationChip';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import CustomSelect from '../../common/form/CustomSelect/CustomSelect';
import MultiInputGroup, {
  IRenderInputsProps,
} from '../../common/form/MultiInputGroup/MultiInputGroup';
import TalentPriceInputs, {
  getDefaultPrice,
  IPriceInput,
} from '../../common/form/TalentPriceInputs/TalentPriceInputs';
import GPTModal from '../../common/modals/GPTModal/GPTModal';
import { getActiveBookmark } from '../helpers/bookmarks';
import { IFormInputs, IProfessionActionsProps, ProfessionFields } from './types';

const bookmarkErrorRelations: { [key in BookmarkName]?: string[] } = {
  group: ['name', 'status_id'],
  price: ['profession_prices'],
};
const getDisabledBookmark = (activeBookmark: BookmarkName): BookmarkName | BookmarkName[] => {
  if (activeBookmark === 'similar') {
    return ['group', 'translation'];
  }
  if (activeBookmark === 'translation') {
    return ['group', 'similar', 'price'];
  }
  return ['similar', 'translation'];
};
const getDefaultFormInputs = (): IFormInputs => ({
  name: '',
  status_id: 1,
  library_id: '',
  priority_id: 1,
  translation_id: 1,
  department_id: '',
  tools: [],
  links: [],
  task_templates: [],
  image_icon: '',
  description: '',
  reason: '',
  profession_prices: [],
});

interface IChechRefetchData {
  isEdit: boolean;
  isVisible: boolean;
  isSimilar: boolean;
  isLibrarySelected: boolean;
}

interface ITranslatedProfessionData {
  department: IDepartment;
  tools: ITool[];
  links: ILink[];
  task_templates: ITaskTemplate[];
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

function TranslatedProfessionData({
  department,
  tools,
  links,
  task_templates,
  translateLibrary,
}: ITranslatedProfessionData) {
  return (
    <Stack gap='1rem'>
      <Stack flexDirection='row' gap='.5rem' alignItems='center'>
        <Typography variant='caption' sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
          Department:
        </Typography>
        {department && (
          <TranslationChip
            data={department}
            click={() => translateLibrary(department?.library_id)}
          />
        )}
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
          Task Templates:
        </Typography>
        <MoreChips
          data={task_templates ?? []}
          propName='name'
          component='translation'
          click={translateLibrary}
        />
      </Stack>
    </Stack>
  );
}

export default function ProfessionActions({
  id,
  commonData,
  isProfile = false,
  isDuplicate = false,
  visible,
  handleActions,
}: IProfessionActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const editorRef = useRef<IEditor | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const {
    activeBookmark,
    changeActiveBookmark,
    getBookmarkErrorName,
    toggleInteraction,
    toggleBookmarkError,
    bookmarks,
  } = useBookmarks(['group', 'translation', 'price', 'similar'], visible);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const statuses = commonData.statuses ?? [];
  const languages = commonData.languages ?? [];
  const priorities = commonData.priorities ?? [];
  const libraries = commonData.groups ?? [];
  const libraries_similar = commonData.groups_similar ?? [];
  const departments = commonData.departments ?? [];
  const tools = commonData.tools ?? [];
  const links = commonData.links ?? [];
  const task_templates = commonData.task_templates ?? [];

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
    defaultValues: getDefaultFormInputs(),
  });

  const libraryId = watch('library_id');
  const translationId = watch('translation_id');

  const { gptModal, translationLoading, handleSaveLibrary, handleCloseGPT, translateLibrary } =
    useTranslateAI({ invalidationQueryKey: 'profession-translation', translationId });

  const clearData = () => reset(getDefaultFormInputs());

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const queryClient = useQueryClient();

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    changeActiveBookmark('group');
    queryClient.removeQueries({ queryKey: ['profession-actions'] });
    queryClient.removeQueries({ queryKey: ['profession-translation'] });
    toggleInteraction();
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as ProfessionFields;
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

  const createMutation = useMutation({
    mutationFn: (data: any) => apiSetData('professions', data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'profession' : 'professions'],
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
    mutationFn: async (data: any) => apiUpdateData(`professions/${id}`, data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'profession' : 'professions'],
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
    queryKey: ['profession-actions', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`professions/${id ?? libraryId}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const { data: translatedData } = useQuery({
    queryKey: ['profession-translation', id, libraryId, translationId],
    queryFn: async () => {
      try {
        const response = await apiGetData(
          `professions/${libraryId}?translation_id=${translationId}`
        );
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
    refetchOnWindowFocus: false,
    enabled: activeBookmark === 'translation' && !!libraryId && !!translationId,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (formData) => {
    const commonData = {
      ...formData,
      profession_prices: formData.profession_prices.map((item) => ({
        ...item,
        start_date: item.start_date ? dayjs(item.start_date).format('DD-MM-YYYY') : undefined,
        end_date: item.end_date ? dayjs(item.end_date).format('DD-MM-YYYY') : undefined,
      })),
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
      const priorityName = data.priority?.name;
      const translationISO = data.translation?.iso2;
      const newActiveBookmark = getActiveBookmark(priorityName, translationISO);
      const disabledBookmark = getDisabledBookmark(newActiveBookmark);
      reset({
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        status_id: data?.status?.id,
        priority_id: data?.priority?.id,
        library_id: data?.library?.id,
        translation_id: data?.translation?.language_id,
        department_id: data?.department?.department_id,
        image_icon: data?.image_icon,
        description: data?.description,
        tools: data?.tools?.map((tool: ITool) => tool.id),
        links: data?.links?.map((el: any) => el.id),
        task_templates: data?.task_templates.map(
          (task_template: ITaskTemplate) => task_template?.id
        ),
        reason: '',
        profession_prices: data?.prices?.map(
          (item: any): IPriceInput => ({
            id: item?.id,
            value: item?.value,
            start_date: item?.start_date,
            end_date: item?.end_date,
            rate_id: item.rate?.id,
            currency_id: item.currency?.id,
          })
        ),
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
      setValue('department_id', data?.department?.department_id);
      setValue(
        'tools',
        data?.tools?.map((tool: ITool) => tool.id)
      );
      setValue(
        'links',
        data?.links?.map((el: any) => el.id)
      );
      setValue(
        'task_templates',
        data?.task_templates?.map((task_template: ITaskTemplate) => task_template?.id)
      );
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
        toggleInteraction();
        clearData();
      }
      if (activeBookmark === 'translation') {
        toggleInteraction('price');
        setValue('translation_id', '');
      }
      if (activeBookmark === 'similar') {
        toggleInteraction();
        queryClient.removeQueries({ queryKey: ['profession-translation'] });
        setValue('priority_id', 2);
        setValue('translation_id', 1);
      }
    }
  }, [id, activeBookmark]);

  return (
    <ActionsDrawer
      id={id}
      title='Profession'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      isLoading={(!!id && isFetching) || translationLoading}
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
      {activeBookmark !== 'price' && (
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
      )}

      {activeBookmark !== 'group' && activeBookmark !== 'price' && (
        <Controller
          name='library_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Group'
                link='/profession'
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

      {activeBookmark !== 'price' && (
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
      )}

      {activeBookmark !== 'price' && (
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
      )}

      {activeBookmark !== 'price' && (
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
                  minWidth: 'calc(33.3% - 1rem)',
                  maxWidth: 380,
                  flexGrow: 1,
                }}
              />
            );
          }}
        />
      )}
      {activeBookmark !== 'price' && activeBookmark !== 'translation' && (
        <>
          <Controller
            name='department_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Department'
                  link='/departments'
                  field={field}
                  options={departments}
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
            control={control}
            name='tools'
            render={({ field: { onChange, value, name }, fieldState: { error } }) => (
              <CustomSelect
                type={name}
                link='/tools'
                options={tools}
                value={value}
                error={error!}
                handleChange={onChange}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                  maxWidth: 380,
                }}
              />
            )}
          />
          <Controller
            control={control}
            name='links'
            render={({ field: { onChange, value, name }, fieldState: { error } }) => (
              <CustomSelect
                type={name}
                link='/links'
                options={links}
                value={value}
                error={error!}
                handleChange={onChange}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                  maxWidth: 380,
                }}
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
                handleChange={onChange}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                  maxWidth: 380,
                }}
              />
            )}
          />
        </>
      )}

      {activeBookmark !== 'price' && activeBookmark === 'translation' && (
        <TranslatedProfessionData
          department={translatedData?.department}
          tools={translatedData?.tools}
          links={translatedData?.links}
          task_templates={translatedData?.task_templates}
          translateLibrary={translateLibrary}
        />
      )}

      {activeBookmark !== 'price' && (
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
      )}
      {activeBookmark !== 'price' && (
        <Controller
          control={control}
          name='image_icon'
          render={({ field: { onChange, value } }) => (
            <AddImage
              value={value}
              text={value ? 'Update image' : 'Add image'}
              onChange={onChange}
            />
          )}
        />
      )}

      <GPTModal
        open={gptModal.open}
        clear={!gptModal.open}
        answer={gptModal.answer}
        link={gptModal.link}
        thread_id={gptModal.thread_id}
        handleClose={handleGPTModalClose}
      />

      <Stack sx={{ display: activeBookmark === 'price' ? 'flex' : 'none' }} gap='1rem'>
        <MultiInputGroup
          control={control}
          name={'profession_prices'}
          error={errors.profession_prices}
          onAddClick={() => {
            const oldValues = getValues('profession_prices');
            setValue('profession_prices', [...oldValues, getDefaultPrice()]);
          }}
          onDeleteClick={(index) => {
            const oldValues = getValues('profession_prices');
            setValue(
              'profession_prices',
              oldValues.filter((_, ind) => ind !== index)
            );
          }}
          label={'Prices'}
          fullScreen={fullScreen}
          renderInputs={({ value, index, el, onChange }: IRenderInputsProps<IPriceInput>) => (
            <TalentPriceInputs
              onChange={onChange}
              index={index}
              errors={errors.profession_prices}
              value={value}
              item={el}
              commonData={commonData}
            />
          )}
        />
      </Stack>
    </ActionsDrawer>
  );
}
interface ITaskTemplate {
  id: number;
  description: string;
  name: string;
  cost: number | string;
  task_quantity: number | string;
  expected_hours: number | string;
  frequency: IFrequenciesType;
  professions: IProfession[];
  parent_task_templates: Array<{
    id: number;
    name: string;
  }>;
  step_templates: IStepTemplate[];
  created_by?: IUser;
  created_at: string;
  action: any;
  object: any;
  tool: any;
}
