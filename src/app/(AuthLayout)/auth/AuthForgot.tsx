'use client';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import useNotification from '@/hooks/useNotification';
import { apiSetData } from '@/lib/fetch';
import { Typography, Button, Stack, TextField } from '@mui/material';

interface IFormInputs {
  email: string;
}

export default function AuthForgot() {
  const [errors, setErrors] = useState<any>([]);
  const showNotification = useNotification();
  const { register, handleSubmit } = useForm<IFormInputs>();

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const result = await apiSetData('forgot', data);
    if (result?.success) {
      showNotification('Success. Please, check your email', 'success');
    } else {
      const newErrors: any = {};
      for (const [key, value] of Object.entries(result.data)) {
        const [error] = value as string[];
        newErrors[key] = error;
      }
      showNotification('Something went wrong', 'error');
      setErrors(newErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap='1rem'>
        <Typography fontWeight='600' variant='h5' textTransform='capitalize' textAlign='center'>
          Restore password
        </Typography>

        <Stack>
          <Typography
            variant='subtitle1'
            fontWeight={600}
            component='label'
            htmlFor='email'
            mb='5px'
          >
            Email
          </Typography>
          <TextField
            id='email'
            variant='outlined'
            type='email'
            placeholder='example@mail.com'
            error={!!errors.email}
            helperText={errors.email ? errors.email : ''}
            fullWidth
            {...register('email')}
          />
        </Stack>
        <Button color='primary' variant='contained' size='large' fullWidth type='submit'>
          Restore
        </Button>
      </Stack>
    </form>
  );
}
