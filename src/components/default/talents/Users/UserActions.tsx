'use client';
import AddImage from '@/components/default/common/components/AddCropimage';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import useUserProfile from '@/hooks/useUserProfile';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryption';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Theme,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generate } from 'generate-password';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';

type UserFields = 'name' | 'email' | 'is_active' | 'password';

interface IFormInputs {
  name: string;
  email: string;
  is_active: string;
  currency_id: string;
  password: string;
  hourly_cost: number | null;
  image: any;
  reason: string;
}

interface IUserActionsProps {
  id: number | null;
  visible: boolean;
  isProfile?: boolean;
  commonData: ICommonData;
  pagePermissions: { [permission: string]: string };
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function UserActions({
  id,
  commonData,
  visible,
  pagePermissions,
  isProfile = false,
  isDuplicate = false,
  handleActions,
}: IUserActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const { isAdmin } = useAuthStore();
  const { updateUserProfile } = useUserProfile();
  const [fullScreen, setFullScreen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const availabilities = commonData.availabilities ?? [];
  const currencies = commonData.currencies ?? [];
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const {
    register,
    reset,
    control,
    setValue,
    clearErrors,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      name: '',
      email: '',
      is_active: '',
      password: '',
      currency_id: '',
      hourly_cost: null,
      image: '',
      reason: '',
    },
  });

  const clearData = () =>
    reset({
      name: '',
      email: '',
      is_active: '',
      password: '',
      image: '',
      hourly_cost: null,
      reason: '',
    });

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
      const errorKey = key as UserFields;
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
    mutationFn: (data: any) => apiSetData('users', data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'user' : 'users'],
        });
        if (isProfile) {
          updateUserProfile();
        }
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
    mutationFn: async (data: any) => apiUpdateData(`users/${id}`, data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'user' : 'users'],
        });
        if (isProfile) {
          updateUserProfile();
        }
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
    queryKey: ['user', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`users/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = { ...data };
    if (id && !isDuplicate) {
      if (typeof commonData.image === 'string') {
        delete commonData.image;
      }
      updateMutation.mutate(commonData);
    } else {
      createMutation.mutate(commonData);
    }
  };

  const submitHandler = handleSubmit(onSubmit);

  const handleShowPassword = () => setShowPassword(!showPassword);

  const submitForm = (e: FormEvent) => {
    e.preventDefault();
    clearErrors();
    submitHandler();
  };

  const generatePassword = () => {
    const newPassword = generate({
      length: 12,
      numbers: true,
    });
    setValue('password', newPassword);
  };

  useEffect(() => {
    if (data) {
      reset({
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        email: data.email,
        is_active: data.is_active,
        password: data.password,
        hourly_cost: data.hourly_cost,
        currency_id: data.currency?.id ?? '',
        image: isDuplicate ? '' : data.image,
        reason: '',
      });
      setCreationInfo({
        created_at: data.created_at,
        created_by: data.created_by,
      });
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
      title='User'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      hideHandler={hideHandler}
      resetHandler={clearData}
      submitForm={submitForm}
      changeActiveBookmark={changeActiveBookmark}
      toggleBookmarkError={toggleBookmarkError}
      fullScreen={fullScreen}
      fullScreenHandler={fullScreenHandler}
      register={register}
      isLoading={isFetching}
      errors={errors}
      isDuplicate={isDuplicate}
    >
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('name')}
        label={<CustomLabel label={'Name'} required />}
        error={!!errors.name}
        helperText={errors.name ? errors.name?.message : ''}
        className={mdDown ? 'mobile' : ''}
        sx={{ minWidth: 'calc(33.3% - 1rem)' }}
      />

      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('email')}
        label={<CustomLabel label={'Email'} required />}
        error={!!errors.email}
        helperText={errors.email ? errors.email?.message : ''}
        className={mdDown ? 'mobile' : ''}
        sx={{ minWidth: 'calc(33.3% - 1rem)' }}
      />
      <Controller
        name='is_active'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <CustomSingleSelect
            label='Is active'
            field={field}
            required
            options={availabilities}
            error={error}
            style={{ minWidth: 'calc(33.3% - 1rem)' }}
          />
        )}
      />
      {checkPermission({
        pagePermissions,
        permissionType: 'change_user_password',
        isAdmin,
      }) && (
        <Stack sx={{ position: 'relative', minWidth: 'calc(33.3% - 1rem)' }}>
          <IconButton
            size='small'
            onClick={generatePassword}
            sx={{
              position: 'absolute',
              top: '-.6rem',
              left: '3.5rem',
              zIndex: 10,
            }}
          >
            <Tooltip title='Generate Password' placement='top'>
              <EnhancedEncryptionIcon sx={{ fontSize: '1.2rem' }} />
            </Tooltip>
          </IconButton>
          <TextField
            variant='standard'
            InputLabelProps={{ shrink: true }}
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password ? errors.password?.message : ''}
            label={<CustomLabel label={'Password'} required />}
            className={mdDown ? 'mobile' : ''}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton aria-label='toggle password visibility' onClick={handleShowPassword}>
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      )}

      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        type='number'
        {...register('hourly_cost')}
        error={!!errors.hourly_cost}
        InputProps={{ inputProps: { min: 0 } }}
        helperText={errors.hourly_cost ? errors.hourly_cost?.message : ''}
        label='Hourly Cost'
        className={mdDown ? 'mobile' : ''}
        sx={{ minWidth: 'calc(33.3% - 1rem)' }}
      />
      <Controller
        name='currency_id'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <CustomSingleSelect
            label='Currency'
            link='/currencies'
            field={field}
            options={currencies}
            error={error}
            style={{ minWidth: 'calc(33.3% - 1rem)' }}
          />
        )}
      />

      <Controller
        control={control}
        name='image'
        render={({ field: { onChange, value } }) => (
          <AddImage value={value} text={value ? 'Update image' : 'Add image'} onChange={onChange} />
        )}
      />
    </ActionsDrawer>
  );
}
