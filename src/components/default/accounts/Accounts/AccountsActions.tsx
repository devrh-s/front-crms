'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
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
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import Password from '../../common/form/Password/Password';

type AccountsFields =
  | 'name'
  | 'inner_client_id'
  | 'login'
  | 'password'
  | 'document_link'
  | 'status_id'
  | 'link'
  | 'tool_id'
  | 'owner_id'
  | 'users'
  | 'note'
  | 'verification_accounts';

interface IFormInputs {
  name: string;
  login: string;
  password: string;
  document_link: string;
  link: string;
  status_id: number | string;
  owner_id: number | string;
  inner_client_id: number | string;
  tool_id: number | string;
  verification_accounts: number[];
  users: number[];
  reason: string;
  note: string;
}

interface IAccountsActionsProps {
  id: number | null;
  visible: boolean;
  url?: string;
  isProfile?: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function AccountsActions({
  id,
  url,
  commonData,
  isProfile = false,
  isDuplicate = false,
  visible,
  handleActions,
}: IAccountsActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const editorRef = useRef<IEditor | null>(null);

  const {
    register,
    reset,
    control,
    setValue,
    getValues,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      name: '',
      login: '',
      password: '',
      document_link: '',
      link: '',
      status_id: '',
      inner_client_id: '',
      tool_id: '',
      owner_id: '',
      verification_accounts: [],
      users: [],
      reason: '',
      note: '',
    },
  });

  const clearData = () =>
    reset({
      name: '',
      login: '',
      password: '',
      document_link: '',
      link: '',
      status_id: '',
      inner_client_id: '',
      tool_id: '',
      owner_id: '',
      verification_accounts: [],
      users: [],
      reason: '',
      note: '',
    });

  const tools = commonData?.tools ?? [];
  const statuses = commonData?.statuses ?? [];
  const inner_clients = commonData?.inner_clients ?? [];
  const users = commonData?.users ?? [];

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
      const errorKey = key as AccountsFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
    toggleBookmarkError('profile');
  };

  const handleSetPassword = (newPassword: string) => {
    setValue('password', newPassword);
  };

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => apiSetData(url ?? 'accounts', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'account' : (url ?? 'accounts')],
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
    mutationFn: async (data: any) => apiUpdateData(url ? `${url}/${id}` : `accounts/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'account' : (url ?? 'accounts')],
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
    queryKey: ['account', id],
    queryFn: async () => {
      const response = await apiGetData(url ? `${url}/${id}` : `accounts/${id}`);
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
        login: data?.login,
        password: data?.password,
        status_id: data?.status?.id,

        inner_client_id: data?.inner_client?.id,
        tool_id: data?.tool?.id,
        verification_accounts: data?.verifications.map((el: any) => el.id),
        users: data?.users.map((el: any) => el.user.id),
        owner_id: data?.owner?.id,
        link: data?.link,
        note: data?.note,
        document_link: data?.document_link,
        reason: '',
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

  return (
    <ActionsDrawer
      id={id}
      title='Account'
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
      register={register}
      isLoading={isFetching}
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
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('login')}
        label={<CustomLabel label={'Login'} required />}
        error={!!errors.login}
        helperText={errors.login ? errors.login?.message : ''}
        className={mdDown ? 'mobile' : ''}
        sx={{
          minWidth: 'calc(33.3% - 1rem)',
          '&.mobile': {
            width: 'auto',
            flex: '1',
          },
        }}
      />
      <Password
        error={errors.password}
        required
        handleChange={handleSetPassword}
        style={{
          minWidth: 'calc(33.3% - 1rem)',
        }}
        register={register('password')}
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
        {...register('document_link')}
        error={!!errors.document_link}
        helperText={errors.document_link ? errors.document_link?.message : ''}
        label='Document link'
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
        name='tool_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Tool'
              link='/tools'
              field={field}
              required
              options={tools}
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
              label='Status'
              link='/statuses'
              field={field}
              required
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
        name='inner_client_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Inner client'
              field={field}
              link='/inner-clients'
              required
              options={inner_clients}
              error={error}
              style={{
                minWidth: 'calc(33.3% - 1rem)',
              }}
            />
          );
        }}
      />
      <Controller
        name='owner_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Owner'
              link='/users'
              field={field}
              options={users}
              required
              error={error}
              style={{
                minWidth: 'calc(33.3% - 1rem)',
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
            handleChange={onChange}
            style={{
              minWidth: 'calc(33.3% - 1rem)',
            }}
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
            options={commonData.accounts ? commonData.accounts : []}
            value={value}
            error={error!}
            handleChange={onChange}
            style={{
              minWidth: 'calc(33.3% - 1rem)',
            }}
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
