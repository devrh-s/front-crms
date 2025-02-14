'use client';

import AiButton from '@/components/default/common/components/AiButton';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomSelect from '@/components/default/common/form/CustomSelect/CustomSelect';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import CountryCity from '@/components/default/common/related/actions/CountryCity/CountryCity';
import useBookmarks from '@/hooks/useBookmarks';
import useGenerateAI from '@/hooks/useGenerateAI';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { TextField, Theme, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import DateInput from '../../common/form/DateInput/DateInput';
import GPTModal from '../../common/modals/GPTModal/GPTModal';
import JobTemplateInfo from './JobTemplateInfo';
import { IFormInputs, IJobPostActionsProps, JobPostFields } from './types';

const availabilities = [
  { id: 0, name: 'No' },
  { id: 1, name: 'Yes' },
];
const bookmarkErrorRelations = {
  profile: [
    'name',
    'job_account_id',
    'publish_date',
    'status_id',
    'link',
    'country_id',
    'city_id',
    'post_template_id',
    'account_id',
    'planned_date',
    'published_by',
    'cost',
    'currency_id',
    'contact_accounts',
    'full_post',
    'shift_id',
    'end_date',
  ],
  steps: ['steps'],
};
const getDefaultFormInputs = (): IFormInputs => ({
  name: '',
  slug: '',
  job_account_id: '',
  account_id: '',
  publish_date: '',
  status_id: '',
  link: '',
  country_id: '',
  shift_id: '',
  city_id: '',
  post_template_id: '',
  planned_date: '',
  published_by: '',
  cost: '',
  currency_id: '',
  contact_accounts: [],
  full_post: '',
  end_date: '',
  published_site: '',
});

export default function JobPostActions({
  id,
  commonData,
  isProfile = false,
  visible,
  handleActions,
  isDuplicate = false,
  url,
}: IJobPostActionsProps) {
  const showNotification = useNotification();

  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const [idJobTemplate, setIdJobTemplate] = useState<number | null>(null);
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);

  const editorRef = useRef<IEditor | null>(null);

  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const job_accounts = commonData.job_accounts ?? [];
  const accounts = commonData.accounts ?? [];
  const statuses = commonData.statuses ?? [];
  const countries = commonData.countries ?? [];
  const cities = commonData.cities ?? [];
  const post_templates = commonData.post_templates ?? [];
  const post_templates_full = commonData.post_templates_full ?? [];
  const users = commonData.users ?? [];
  const shifts = commonData.shifts ?? [];
  const currencies = commonData.currencies ?? [];
  const contact_accounts = commonData.accounts ?? [];

  const {
    activeBookmark,
    getBookmarkErrorName,
    changeActiveBookmark,
    toggleBookmarkError,
    toggleInteraction,
    bookmarks,
  } = useBookmarks(['profile', 'job_template'], visible);

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
  } = useForm<IFormInputs>({
    defaultValues: getDefaultFormInputs(),
  });

  const clearData = () => {
    reset(getDefaultFormInputs());
    toggleInteraction('job_template');
  };

  const fullScreenHandler = () => setFullScreen(!fullScreen);
  const watchPostTemplateId = watch('post_template_id');
  const watchAccountId = watch('account_id');
  const watchJobAccountId = watch('job_account_id');
  const watchContactAccounts = watch('contact_accounts');
  const watcherName = watch('name');

  const { gptModal, responseGenerating, handleCloseGPT, generateResponse } = useGenerateAI({
    url: watchJobAccountId ? 'openai/job-post' : 'openai/job-post/instagram',
  });

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as JobPostFields;
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
    mutationFn: (data: any) => apiSetData(url ?? 'job-posts', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'job-post' : (url ?? 'job-posts')],
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
    mutationFn: async (data: any) => apiUpdateData(url ? `${url}/${id}` : `job-posts/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'job-post' : (url ?? 'job-posts')],
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
  const {
    data: dataJobTemplate,
    isPending: isPendingJobTemplate,
    refetch: refetchJobTemplate,
  } = useQuery({
    queryKey: [`job-tamplete-${idJobTemplate}`],
    queryFn: async () => {
      const response = await apiGetData(`job-templates/${idJobTemplate}?isShort=1`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['job-post', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(url ? `${url}/${id}` : `job-posts/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
      publish_date: data?.publish_date
        ? dayjs(data.publish_date).format('DD-MM-YYYY HH:mm:ss')
        : null,
      planned_date: data?.planned_date ? dayjs(data.planned_date).format('DD-MM-YYYY') : null,
      end_date: data?.end_date ? dayjs(data.end_date).format('DD-MM-YYYY') : null,
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
        slug: `${isDuplicate ? `${data?.slug} COPY` : data?.slug}`,
        job_account_id: data.job_account?.id,
        account_id: data.account?.id,
        publish_date: data.publish_date,
        status_id: data.status?.id,
        shift_id: data.shift?.id,
        link: data.link,
        country_id: data?.country?.country_id,
        city_id: data?.city?.city_id,
        post_template_id: data.post_template?.id,
        planned_date: data.planned_date,
        published_by: data.published_by?.id,
        published_site: data.published_site,
        cost: data.cost,
        currency_id: data.currency?.id,
        contact_accounts: data.contact_accounts?.map((contact_account: any) => contact_account.id),
        full_post: data.full_post,
        end_date: data.end_date,
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

  useEffect(() => {
    if (!id) {
      setValue('slug', watcherName?.replace(/ /g, '-').toLowerCase());
    }
  }, [id, watcherName]);

  useEffect(() => {
    if (watchPostTemplateId && post_templates_full) {
      const id =
        post_templates_full.find((el) => el.id === watchPostTemplateId)?.job_template?.id ?? null;

      setIdJobTemplate(id);
    }
  }, [watchPostTemplateId]);

  useEffect(() => {
    if (idJobTemplate) {
      refetchJobTemplate();
      toggleInteraction();
    }
  }, [idJobTemplate]);

  return (
    <ActionsDrawer
      id={id}
      title='Job Post'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      hideHandler={hideHandler}
      resetHandler={clearData}
      submitForm={submitForm}
      isLoading={isFetching}
      changeActiveBookmark={changeActiveBookmark}
      toggleBookmarkError={toggleBookmarkError}
      fullScreen={fullScreen}
      fullScreenHandler={fullScreenHandler}
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
            sx={{ minWidth: 'calc(50% - 0.75rem)' }}
          />
          <TextField
            variant='standard'
            InputLabelProps={{ shrink: true }}
            {...register('slug')}
            error={!!errors.slug}
            label={<CustomLabel label={'Slug'} required />}
            helperText={errors.slug ? errors.slug?.message : ''}
            className={mdDown ? 'mobile' : ''}
            sx={{ minWidth: 'calc(50% - 0.75rem)' }}
          />

          <Controller
            control={control}
            name='contact_accounts'
            render={({ field: { onChange, value, name }, fieldState: { error } }) => (
              <CustomSelect
                type={name}
                link='/accounts'
                options={contact_accounts}
                value={value}
                required
                error={error!}
                style={{
                  minWidth: 'calc(50% - 0.75rem)',
                }}
                handleChange={onChange}
              />
            )}
          />

          <Controller
            name='currency_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Currency'
                  link='/currencies'
                  field={field}
                  options={currencies}
                  required
                  error={error}
                  style={{
                    minWidth: 'calc(50% - 0.75rem)',
                  }}
                />
              );
            }}
          />

          <TextField
            variant='standard'
            InputLabelProps={{ shrink: true }}
            {...register('cost', {
              min: { value: 0, message: 'the value must be greater than zero' },
            })}
            error={!!errors.cost}
            helperText={errors.cost ? errors.cost?.message : ''}
            label={<CustomLabel label={'Cost'} required />}
            className={mdDown ? 'mobile' : ''}
            sx={{ minWidth: 'calc(50% - 0.75rem)' }}
            type='number'
            inputProps={{
              min: 0,
            }}
          />

          <Controller
            name='account_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Account'
                  link='/accounts'
                  field={field}
                  required
                  options={accounts}
                  disabled={!!watch('job_account_id')}
                  error={error}
                  style={{
                    minWidth: 'calc(50% - 0.75rem)',
                  }}
                />
              );
            }}
          />
          <Controller
            name='job_account_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Job account'
                  link='/job-accounts'
                  field={field}
                  required
                  options={job_accounts}
                  error={error}
                  disabled={!!watch('account_id')}
                  style={{
                    minWidth: 'calc(50% - 0.75rem)',
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
                    minWidth: 'calc(50% - 0.75rem)',
                  }}
                />
              );
            }}
          />
          <TextField
            variant='standard'
            InputLabelProps={{ shrink: true }}
            {...register('link')}
            error={!!errors.link}
            helperText={errors.link ? errors.link?.message : ''}
            label='Link'
            className={mdDown ? 'mobile' : ''}
            sx={{
              minWidth: 'calc(50% - 0.75rem)',
              '&.mobile': {
                width: 'auto',
                flex: '1',
              },
            }}
          />
          <CountryCity
            control={control}
            countries={countries}
            cities={cities}
            watch={watch}
            setValue={setValue}
            required={{
              country: true,
              city: false,
            }}
            styles={{
              minWidth: 'calc(50% - 0.75rem)',
            }}
          />
          <Controller
            name='post_template_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Post Template'
                  link='/post-templates'
                  field={field}
                  options={post_templates}
                  error={error}
                  required
                  style={{
                    minWidth: 'calc(50% - 0.75rem)',
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
                  link='/shifts'
                  field={field}
                  options={shifts}
                  error={error}
                  style={{
                    minWidth: 'calc(50% - .75rem)',
                  }}
                />
              );
            }}
          />
          <Controller
            name='published_site'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <CustomSingleSelect
                label='Published Site'
                field={field}
                required
                options={availabilities ?? []}
                error={error}
                style={{
                  minWidth: 'calc(50% - .75rem)',
                }}
              />
            )}
          />
          <Controller
            name='published_by'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Published By'
                  link='/users'
                  field={field}
                  options={users}
                  required
                  error={error}
                  style={{
                    minWidth: 'calc(50% - 0.75rem)',
                  }}
                />
              );
            }}
          />

          <Controller
            name='publish_date'
            control={control}
            render={({ field }) => (
              <DateInput
                label={'Publish date'}
                format='DD-MM-YYYY HH:mm:ss'
                error={errors?.publish_date}
                style={{
                  minWidth: 'calc(50% - 1rem)',
                  '&.mobile': {
                    gridColumn: 'auto',
                  },
                }}
                field={field}
                variant='date-time'
              />
            )}
          />
          <Controller
            name='end_date'
            control={control}
            render={({ field }) => (
              <DateInput
                label={'End Date'}
                format='DD-MM-YYYY'
                error={errors?.end_date}
                style={{
                  minWidth: 'calc(50% - 1rem)',
                  '&.mobile': {
                    gridColumn: 'auto',
                  },
                }}
                field={field}
              />
            )}
          />
          <Controller
            name='planned_date'
            control={control}
            render={({ field }) => (
              <DateInput
                label={'Planned Date'}
                format='DD-MM-YYYY'
                error={errors?.planned_date}
                required
                style={{
                  minWidth: 'calc(50% - 1rem)',
                  '&.mobile': {
                    gridColumn: 'auto',
                  },
                }}
                field={field}
              />
            )}
          />

          <AiButton
            buttonText={'Full Post'}
            isMobile={mdDown}
            isFullScreen={fullScreen}
            isLoading={responseGenerating}
            data={{
              job_account_id: watchJobAccountId,
              account_id: watchAccountId,
              post_template_id: watchPostTemplateId,
              contact_accounts: watchContactAccounts,
            }}
            validationData={{
              'account or job account': !!watchAccountId || !!watchJobAccountId,
              'post template': !!watchPostTemplateId,
              'contact accounts': !!watchContactAccounts?.length,
            }}
            generateResponse={generateResponse}
          />

          <Controller
            control={control}
            name='full_post'
            render={({ field: { onChange, value, name }, fieldState: { error } }) => (
              <CustomTextEditor
                ref={editorRef}
                value={value}
                fullScreen={fullScreen}
                height={fullScreen ? 500 : 150}
                onEditorChange={onChange}
                title={'full post'}
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
      <GPTModal
        open={gptModal.open}
        clear={!gptModal.open}
        answer={gptModal.answer}
        link={gptModal.link}
        thread_id={gptModal.thread_id}
        handleClose={(data: string) => {
          setValue('full_post', data);
          handleCloseGPT();
        }}
      />
      <JobTemplateInfo activeBookmark={activeBookmark} jobTemplate={dataJobTemplate} />
    </ActionsDrawer>
  );
}
