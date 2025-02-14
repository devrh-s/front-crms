'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import LanguageLevelInputs, {
  getDefaultLanguage,
  ILanguageLevelInput,
} from '@/components/default/common/form/LanguageLevelInputs/LanguageLevelInputs';
import MultiInputGroup, {
  IRenderInputsProps,
} from '@/components/default/common/form/MultiInputGroup/MultiInputGroup';
import useBookmarks, { BookmarkName } from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { Stack, TextField, Theme, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import CustomSelect from '../../common/form/CustomSelect/CustomSelect';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import DateInput from '../../common/form/DateInput/DateInput';
import { IFormInputs, IJobRequestsActionsProps, JobRequestsFields } from './types';

const bookmarkErrorRelations: { [key in BookmarkName]?: string[] } = {
  profile: [
    'name',
    'rate_id',
    'shift_id',
    'inner_client_id',
    'profession_id',
    'manager_id',
    'close_date',
    'demand_date',
    'note',
    'jobTemplates',
    'reason',
    'quantity',
    'status_id',
    'tools',
    'task_templates',
  ],

  language: ['languages'],
};
const getDefaultFormInputs = (): IFormInputs => ({
  name: '',
  rate_id: '',
  shift_id: '',
  inner_client_id: '',
  quantity: '',
  profession_id: '',
  manager_id: '',
  close_date: null,
  demand_date: null,
  note: '',
  jobTemplates: [],
  task_templates: [],
  reason: '',
  status_id: '',
  tools: [],
  languages: [{ language_id: 1 }],
});

export default function JobRequestsActions({
  id,
  commonData,
  url,
  visible,
  isProfile = false,
  isDuplicate = false,
  handleActions,
}: IJobRequestsActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const {
    activeBookmark,
    getBookmarkErrorName,
    changeActiveBookmark,
    toggleBookmarkError,
    bookmarks,
  } = useBookmarks(['profile', 'language'], visible);
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const editorNoteRef = useRef<IEditor | null>(null);
  const statuses = commonData.statuses ?? [];

  const {
    register,
    reset,
    control,
    getValues,
    clearErrors,
    setValue,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: getDefaultFormInputs(),
  });

  const clearData = () => reset(getDefaultFormInputs());

  const rates = commonData?.rates ?? [];
  const professions = commonData?.professions ?? [];
  const inner_clients = commonData?.inner_clients ?? [];
  const managers = commonData?.managers ?? [];
  const task_templates = commonData?.task_templates ?? [];
  const shifts = commonData?.shifts ?? [];
  const tools = commonData?.tools ?? [];

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
      const errorKey = key as JobRequestsFields;
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

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => apiSetData(url ?? 'job-requests', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'job-request' : 'job-requests'],
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
      apiUpdateData(url ? `${url}/${id}` : `job-requests/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'job-request' : 'job-requests'],
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
    queryKey: ['job-request', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(url ? `${url}/${id}` : `job-requests/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
      close_date: data.close_date ? dayjs(data.close_date).format('DD-MM-YYYY') : null,
      demand_date: data.demand_date ? dayjs(data.demand_date).format('DD-MM-YYYY') : null,
    };
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
    if (data) {
      reset({
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        rate_id: data.rate?.id,
        shift_id: data.shift?.id,
        inner_client_id: data.innerClient?.id,
        quantity: data.quantity,
        profession_id: data.profession?.profession_id,
        manager_id: data.manager?.id,
        close_date: data.close_date,
        demand_date: data.demand_date,
        note: data.note,
        jobTemplates: data.jobTemplates?.map((el: any) => el.id),
        task_templates: data?.task_templates?.map((el: any) => el.id),
        tools: data.tools?.map((el: any) => el.id),
        languages: data.languages?.map(
          (item: any): ILanguageLevelInput => ({
            id: item.id,
            language_id: item.language?.language_id,
            level_id: item.level?.level_id,
          })
        ),
        reason: '',
        status_id: data.status?.id,
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
      title='Job Request'
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
      isDuplicate={isDuplicate}
    >
      {activeBookmark === 'profile' && (
        <>
          <TextField
            variant='standard'
            InputLabelProps={{ shrink: true }}
            {...register('name')}
            error={!!errors.name}
            label={<CustomLabel label={'Name'} required />}
            helperText={errors.name ? errors.name?.message : ''}
            className={mdDown ? 'mobile' : ''}
            sx={{
              minWidth: 'calc(50% - .75rem)',
              '&.mobile': {
                width: 'auto',
                flex: '1',
              },
            }}
          />

          <Controller
            name='status_id'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <CustomSingleSelect
                label='Status'
                field={field}
                link='/statuses'
                options={statuses}
                required
                error={error}
                style={{ minWidth: 'calc(50% - .75rem)' }}
              />
            )}
          />
          <TextField
            variant='standard'
            type='number'
            {...register('quantity')}
            error={!!errors.quantity}
            helperText={errors.quantity ? errors.quantity?.message : ''}
            label={<CustomLabel label={'Quantity'} required />}
            className={mdDown ? 'mobile' : ''}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{ min: 0 }}
            sx={{ minWidth: 'calc(50% - .75rem)' }}
          />

          <Controller
            name='rate_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Rate'
                  field={field}
                  options={rates}
                  link='/rates'
                  required
                  error={error}
                  style={{
                    minWidth: 'calc(50% - .75rem)',
                    '&.mobile': {
                      width: 'auto',
                      flex: '1',
                    },
                  }}
                />
              );
            }}
          />

          <Controller
            name='shift_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Shift'
                  field={field}
                  options={shifts}
                  required
                  link='/shifts'
                  error={error}
                  style={{
                    minWidth: 'calc(50% - .75rem)',
                    '&.mobile': {
                      width: 'auto',
                      flex: '1',
                    },
                  }}
                />
              );
            }}
          />

          <Controller
            name='profession_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Proffesion'
                  field={field}
                  options={professions}
                  link='/professions'
                  required
                  error={error}
                  style={{
                    minWidth: 'calc(50% - .75rem)',
                    '&.mobile': {
                      width: 'auto',
                      flex: '1',
                    },
                  }}
                />
              );
            }}
          />
          <Controller
            name='inner_client_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Inner client'
                  field={field}
                  required
                  link='/inner-clients'
                  options={inner_clients}
                  error={error}
                  style={{
                    minWidth: 'calc(50% - .75rem)',
                    '&.mobile': {
                      width: 'auto',
                      flex: '1',
                    },
                  }}
                />
              );
            }}
          />

          <Controller
            name='manager_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Manager'
                  field={field}
                  options={managers}
                  error={error}
                  link='/users'
                  required
                  style={{
                    minWidth: 'calc(50% - .75rem)',
                    '&.mobile': {
                      width: 'auto',
                      flex: '1',
                    },
                  }}
                />
              );
            }}
          />

          <Controller
            control={control}
            name='jobTemplates'
            render={({ field: { onChange, value, name }, fieldState: { error } }) => (
              <CustomSelect
                type={name}
                link='/job-templates'
                options={commonData.job_templates ? commonData.job_templates : []}
                value={value}
                error={error!}
                handleChange={onChange}
                style={{
                  minWidth: 'calc(50% - .75rem)',
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
                required
                handleChange={onChange}
                style={{
                  minWidth: 'calc(50% - .75rem)',
                }}
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
                handleChange={onChange}
                style={{
                  minWidth: 'calc(100% - 1.5rem)',
                }}
              />
            )}
          />
          <Controller
            name='close_date'
            control={control}
            render={({ field }) => (
              <DateInput
                label={'Planned Date'}
                format='DD-MM-YYYY'
                error={errors?.close_date}
                style={{
                  minWidth: 'calc(50% - .75rem)',
                  '&.mobile': {
                    gridColumn: 'auto',
                  },
                }}
                field={field}
              />
            )}
          />

          <Controller
            name='demand_date'
            control={control}
            render={({ field }) => (
              <DateInput
                label={'Demand Date'}
                format='DD-MM-YYYY'
                error={errors?.demand_date}
                style={{
                  minWidth: 'calc(50% - .75rem)',
                  '&.mobile': {
                    gridColumn: 'auto',
                  },
                }}
                field={field}
              />
            )}
          />

          <Controller
            control={control}
            name='note'
            render={({ field: { onChange, value, name }, fieldState: { error } }) => (
              <CustomTextEditor
                ref={editorNoteRef}
                value={value}
                fullScreen={fullScreen}
                height={fullScreen ? 500 : 150}
                onEditorChange={onChange}
                title={name}
                error={error?.message}
                style={{
                  display: activeBookmark === 'profile' ? 'flex' : 'none',
                  width: '100%',
                }}
              />
            )}
          />
        </>
      )}
      {activeBookmark === 'language' && (
        <Stack sx={{ display: activeBookmark === 'language' ? 'flex' : 'none' }} gap='1rem'>
          <MultiInputGroup
            control={control}
            fullScreen={fullScreen}
            required
            error={errors.languages}
            onDeleteClick={(index) => {
              const oldValues = getValues('languages');
              setValue(
                'languages',
                oldValues.filter((_, ind) => ind !== index)
              );
            }}
            onAddClick={() => {
              const oldValues = getValues('languages');
              setValue('languages', [...oldValues, getDefaultLanguage()]);
            }}
            label={'Languages'}
            name={'languages'}
            renderInputs={({
              value,
              index,
              el,
              onChange,
            }: IRenderInputsProps<ILanguageLevelInput>) => (
              <LanguageLevelInputs
                onChange={onChange}
                languagesArr={value}
                index={index}
                elem={el}
                languages={commonData.languages ?? []}
                levels={commonData.levels ?? []}
                errors={errors.languages}
              />
            )}
          />
        </Stack>
      )}
    </ActionsDrawer>
  );
}
