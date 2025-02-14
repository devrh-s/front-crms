'use client';

import useNotification from '@/hooks/useNotification';
import { apiGetData, apiUpdateData } from '@/lib/fetch';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';

interface IResult {
  success: boolean;
  message: string;
  data?: any;
}
interface IFormInputs {
  mail_driver: string;
  mail_host: string;
  mail_port: string;
  mail_username: string;
  mail_password: string;
  mail_from_name: string;
  mail_from_email: string;
  mail_encryption: string;
  mail_connection: string;
}
type SmtpFields =
  | 'mail_driver'
  | 'mail_host'
  | 'mail_port'
  | 'mail_username'
  | 'mail_password'
  | 'mail_from_name'
  | 'mail_from_email'
  | 'mail_encryption'
  | 'mail_connection';
export default function Smtp() {
  const {
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      mail_driver: '',
      mail_host: '',
      mail_port: '',
      mail_username: '',
      mail_password: '',
      mail_from_name: '',
      mail_from_email: '',
      mail_encryption: '',
      mail_connection: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState(1);
  const showNotification = useNotification();
  const queryClient = useQueryClient();

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['smtp-settings', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`smtp-settings/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as SmtpFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiUpdateData(`smtp-settings/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['smtp-settings'],
        });
        showNotification('Successfully updated', 'success');
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

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    updateMutation.mutate(data);
  };

  useEffect(() => {
    if (data) {
      reset({
        mail_connection: data.mail_connection,
        mail_driver: data.mail_driver,
        mail_encryption: data.mail_encryption,
        mail_from_email: data.mail_from_email,
        mail_from_name: data.mail_from_name,
        mail_host: data.mail_host,
        mail_password: data.mail_password,
        mail_port: data.mail_port,
        mail_username: data.mail_username,
      });
    }
  }, [data]);

  return (
    <Box
      sx={{
        p: '2rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <Typography
        sx={{
          textAlign: 'center',
        }}
      >
        SMTP settings
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            alignItems: 'center',
            maxWidth: '700px',
            margin: '0 auto',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: '2rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TextField
              variant='standard'
              InputLabelProps={{ shrink: true }}
              {...register('mail_driver')}
              error={!!errors.mail_driver}
              label={<CustomLabel label={'Driver'} required />}
              helperText={errors.mail_driver ? errors.mail_driver?.message : ''}
              sx={{ maxWidth: '188px' }}
              disabled={isFetching}
            />
            <TextField
              variant='standard'
              InputLabelProps={{ shrink: true }}
              {...register('mail_host')}
              error={!!errors.mail_host}
              label={<CustomLabel label={'Host'} required />}
              helperText={errors.mail_host ? errors.mail_host?.message : ''}
              sx={{ maxWidth: '12rem' }}
              disabled={isFetching}
            />
            <TextField
              variant='standard'
              InputLabelProps={{ shrink: true }}
              {...register('mail_port')}
              error={!!errors.mail_port}
              label={<CustomLabel label={'Port'} required />}
              helperText={errors.mail_port ? errors.mail_port?.message : ''}
              sx={{ maxWidth: '12rem' }}
              disabled={isFetching}
            />
            <TextField
              variant='standard'
              InputLabelProps={{ shrink: true }}
              {...register('mail_username')}
              label={<CustomLabel label={'Username'} required />}
              error={!!errors.mail_username}
              helperText={errors.mail_username ? errors.mail_username?.message : ''}
              sx={{ maxWidth: '12rem' }}
              disabled={isFetching}
            />
            <TextField
              variant='standard'
              InputLabelProps={{ shrink: true }}
              label={<CustomLabel label={'Password'} required />}
              {...register('mail_password')}
              error={!!errors.mail_password}
              helperText={errors.mail_password ? errors.mail_password?.message : ''}
              sx={{ maxWidth: '12rem' }}
              disabled={isFetching}
            />
            <TextField
              variant='standard'
              InputLabelProps={{ shrink: true }}
              {...register('mail_from_name')}
              error={!!errors.mail_from_name}
              label={<CustomLabel label={'From name'} required />}
              helperText={errors.mail_from_name ? errors.mail_from_name?.message : ''}
              sx={{ maxWidth: '12rem' }}
              disabled={isFetching}
            />
            <TextField
              variant='standard'
              InputLabelProps={{ shrink: true }}
              {...register('mail_from_email')}
              error={!!errors.mail_from_email}
              label={<CustomLabel label={'From email'} required />}
              helperText={errors.mail_from_email ? errors.mail_from_email?.message : ''}
              sx={{ maxWidth: '12rem' }}
              disabled={isFetching}
            />

            <TextField
              variant='standard'
              InputLabelProps={{ shrink: true }}
              {...register('mail_encryption')}
              error={!!errors.mail_encryption}
              label={<CustomLabel label={'Encryption'} required />}
              helperText={errors.mail_encryption ? errors.mail_encryption?.message : ''}
              sx={{ maxWidth: '12rem' }}
              disabled={isFetching}
            />
            <TextField
              variant='standard'
              InputLabelProps={{ shrink: true }}
              {...register('mail_connection')}
              error={!!errors.mail_connection}
              label={<CustomLabel label={'Connection'} required />}
              helperText={errors.mail_connection ? errors.mail_connection?.message : ''}
              sx={{ maxWidth: '12rem' }}
              disabled={isFetching}
            />
          </Box>
          <Button
            variant='contained'
            size='large'
            type='submit'
            sx={{ minWidth: '12rem' }}
            endIcon={<AddCircleOutlineIcon />}
            disabled={isFetching}
          >
            Update
          </Button>
        </Box>
      </form>
    </Box>
  );
}
