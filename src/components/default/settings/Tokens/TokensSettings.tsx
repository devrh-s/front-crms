'use client';

import useNotification from '@/hooks/useNotification';
import { apiSetData } from '@/lib/fetch';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Dispatch, SetStateAction } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import DateInput from '../../common/form/DateInput/DateInput';
import { TokensVariant } from './types';

interface ITokenSettings {
  setTokensVariant: Dispatch<SetStateAction<TokensVariant>>;
}

interface IFormInputs {
  name: string;
  description: string;
  expired_at: string;
}

type TokensFields = 'name' | 'description' | 'expired_at';

export default function TokensSettings({ setTokensVariant }: ITokenSettings) {
  const queryClient = useQueryClient();
  const showNotification = useNotification();

  const {
    register,
    control,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      name: '',
      description: '',
      expired_at: '',
    },
  });

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as TokensFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: IFormInputs) => apiSetData('tokens', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['tokens'],
        });
        showNotification('Successfully create', 'success');
        setTokensVariant(TokensVariant.TABLE);
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
    const formattedData = {
      ...data,
      expired_at: data?.expired_at ? dayjs(data.expired_at).format('DD-MM-YYYY') : '',
    };
    createMutation.mutate(formattedData);
  };

  return (
    <Box padding={'0 1.5rem'}>
      <Box height={60} display={'flex'} alignItems={'center'}>
        <Typography variant='h1' fontWeight={500} fontSize={'1.2rem'}>
          Create new token
        </Typography>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'} gap={'2rem'} flex={1}>
          <Box display={'flex'} flexDirection={'column'} gap={'1rem'} width={'100%'}>
            <Box display={'flex'} gap={'1rem'}>
              <TextField
                InputLabelProps={{ shrink: true }}
                {...register('name')}
                error={!!errors.name}
                label={<CustomLabel label={'Name'} required />}
                helperText={errors.name ? errors.name?.message : ''}
                sx={{ width: '50%' }}
              />
              <Controller
                name='expired_at'
                control={control}
                render={({ field }) => (
                  <DateInput
                    label={'Expired at'}
                    format='DD-MM-YYYY'
                    error={errors?.expired_at}
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
            </Box>

            <TextField
              InputLabelProps={{ shrink: true }}
              {...register('description')}
              error={!!errors.description}
              label={<CustomLabel label={'Description'} required />}
              helperText={errors.description ? errors.description?.message : ''}
              sx={{ width: '100%' }}
              multiline
              rows={4}
            />
          </Box>

          <Box display={'flex'} gap={'1rem'}>
            <Button
              variant='contained'
              size='large'
              type='button'
              sx={{ maxWidth: '12rem' }}
              onClick={() => setTokensVariant(TokensVariant.TABLE)}
            >
              Back
            </Button>
            <Button variant='contained' size='large' type='submit' sx={{ maxWidth: '12rem' }}>
              Create
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
}
