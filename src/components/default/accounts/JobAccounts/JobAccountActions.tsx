'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
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
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import CustomSelect from '../../common/form/CustomSelect/CustomSelect';
import Password from '../../common/form/Password/Password';
import { IVerificationAccount } from '../../common/pages/VerificationAccounts/types';

type jobAccountFields =
  | 'name'
  | 'job_site_id'
  | 'profile_link'
  | 'login'
  | 'password'
  | 'status_id'
  | 'inner_client_id'
  | 'available_job_posts'
  | 'note'
  | 'verification_accounts'
  | 'users';

interface IFormInputs {
  name: string;
  job_site_id: number | '';
  profile_link: string;
  login: string;
  password: string;
  status_id: number | '';
  inner_client_id: number | '';
  available_job_posts: number | '';
  note: string;
  verification_accounts: number[];
  users: number[];
}

interface IJobAcoountActionsProps {
  id: number | null;
  visible: boolean;
  url?: string;
  commonData: ICommonData;
  isProfile?: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function JobAccountActions({
  id,
  commonData,
  isProfile = false,
  isDuplicate = false,
  url,
  visible,
  handleActions,
}: IJobAcoountActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const editorRef = useRef<IEditor | null>(null);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const job_sites = commonData.job_sites ?? [];
  const statuses = commonData.statuses ?? [];
  const inner_clients = commonData.inner_clients ?? [];
  const users = commonData.users ?? [];
  const verification_accounts = commonData.verification_accounts ?? [];
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );
  // const [loading, setLoading] = useState(false);
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);

  const {
    register,
    watch,
    reset,
    control,
    getValues,
    setValue,
    setError,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      name: '',
      job_site_id: '',
      profile_link: '',
      login: '',
      password: '',
      status_id: '',
      available_job_posts: '',
      inner_client_id: '',
      note: '',
      verification_accounts: [],
      users: [],
    },
  });

  const clearData = () =>
    reset({
      name: '',
      job_site_id: '',
      profile_link: '',
      login: '',
      password: '',
      status_id: '',
      available_job_posts: '',
      inner_client_id: '',
      note: '',
      verification_accounts: [],
      users: [],
    });

  const fullScreenHandler = () => setFullScreen(!fullScreen);
  const watcherIdInnerClient = watch('inner_client_id');
  const watcherIdJobSite = watch('job_site_id');

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    handleActions(false);
    setCreationInfo(null);
  };

  const handleSetPassword = (newPassword: string) => {
    setValue('password', newPassword);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as jobAccountFields;
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
    mutationFn: (data: any) => apiSetData(url ?? 'job-accounts', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'job-account' : (url ?? 'job-accounts')],
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
      apiUpdateData(url ? `${url}/${id}` : `job-accounts/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'job-account' : (url ?? 'job-accounts')],
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
    queryKey: ['job-account', id],
    queryFn: async () => {
      const response = await apiGetData(url ? `${url}/${id}` : `job-accounts/${id}`);
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
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        job_site_id: data.jobSite?.id,
        profile_link: data.profile_link,
        login: data.login,
        password: data.password,
        status_id: data.status?.id,
        inner_client_id: data.innerClient?.id,
        note: data.note,
        available_job_posts: data?.available_job_posts,
        verification_accounts: data.verifications?.map((el: IVerificationAccount) => el.id),
        users: data.users.map((el: { id: number; user: IUser }) => el.user.id),
      });
      setCreationInfo({
        created_at: data.created_at,
        created_by: data.createdBy,
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

  function getNameById(array: any, id: number) {
    const item = array.find((obj: any) => obj.id === id);
    return item ? item.name : null;
  }
  function getSiteById(array: any, id: number) {
    const item = array.find((obj: any) => obj.id === id);
    return item?.website ? item.website.replace('https://', '') : null;
  }

  useEffect(() => {
    if (watcherIdInnerClient && watcherIdJobSite) {
      const nameInnerClient = getNameById(inner_clients, watcherIdInnerClient);
      // const nameJobSite = getSiteById(job_sites, watcherIdJobSite);
      const nameJobSite = getNameById(job_sites, watcherIdJobSite);

      setValue('name', `${nameInnerClient} - ${nameJobSite}`);
    } else {
      setValue('name', '');
    }
  }, [watcherIdInnerClient, watcherIdJobSite]);

  return (
    <ActionsDrawer
      id={id}
      title='Job Account'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      resetHandler={clearData}
      hideHandler={hideHandler}
      submitForm={submitForm}
      changeActiveBookmark={changeActiveBookmark}
      toggleBookmarkError={toggleBookmarkError}
      fullScreen={fullScreen}
      isLoading={isFetching}
      fullScreenHandler={fullScreenHandler}
      register={register}
      errors={errors}
      isDuplicate={isDuplicate}
    >
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        inputProps={{ readOnly: true }}
        {...register('name')}
        label={<CustomLabel label={'Name (read only)'} />}
        error={!!errors.name}
        helperText={errors.name ? errors.name?.message : ''}
        className={mdDown ? 'mobile' : ''}
        sx={{ minWidth: 'calc(50% - 1rem)', flexGrow: 1, pointerEvents: 'none' }}
      />
      <Controller
        name='inner_client_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Inner client'
              link='/inner-clients'
              field={field}
              options={inner_clients}
              error={error}
              required
              style={{
                minWidth: 'calc(50% - 1rem)',
                flexGrow: 1,
              }}
            />
          );
        }}
      />

      <Controller
        name='job_site_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Job site'
              link='/job-sites'
              field={field}
              options={job_sites}
              required
              error={error}
              style={{
                minWidth: 'calc(50% - 1rem)',
                flexGrow: 1,
              }}
            />
          );
        }}
      />

      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('profile_link')}
        error={!!errors.profile_link}
        helperText={errors.profile_link ? errors.profile_link?.message : ''}
        label={<CustomLabel label={'Profile link'} required />}
        className={mdDown ? 'mobile' : ''}
        sx={{ minWidth: 'calc(33.3% - 1rem)', flexGrow: 1 }}
      />

      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('login')}
        error={!!errors.login}
        label={<CustomLabel label={'Login'} required />}
        helperText={errors.login ? errors.login?.message : ''}
        className={mdDown ? 'mobile' : ''}
        sx={{ minWidth: 'calc(50% - 1rem)', flexGrow: 1 }}
      />
      {data && (
        <TextField
          variant='standard'
          type='number'
          InputLabelProps={{ shrink: true }}
          {...register('available_job_posts')}
          disabled
          label={<CustomLabel label={'Available Job Posts'} />}
          className={mdDown ? 'mobile' : ''}
          sx={{ minWidth: 'calc(50% - 1rem)', flexGrow: 1 }}
        />
      )}

      <Password
        error={errors.password}
        required
        handleChange={handleSetPassword}
        style={{
          minWidth: 'calc(50% - 1rem)',
        }}
        register={register('password')}
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
                minWidth: 'calc(50% - 1rem)',
                flexGrow: 1,
              }}
            />
          );
        }}
      />

      <Controller
        control={control}
        name='users'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/users'
            options={users}
            value={value}
            error={error!}
            style={{
              minWidth: 'calc(50% - 1rem)',
              flexGrow: 1,
            }}
            handleChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name='verification_accounts'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/accounts'
            required
            options={verification_accounts}
            value={value}
            error={error!}
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
        name='note'
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
              display: activeBookmark === 'profile' ? 'flex' : 'none',
              width: '100%',
            }}
          />
        )}
      />
    </ActionsDrawer>
  );
}
