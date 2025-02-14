'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import useNotification from '@/hooks/useNotification';
import { apiSetData } from '@/lib/fetch';
import { Typography, Button, Stack, TextField, InputAdornment, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface IFormInputs {
  email: string;
  password: string;
  password_confirmation: string;
}

export default function AuthReset() {
  const { register, handleSubmit } = useForm<IFormInputs>();
  const showNotification = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<any>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const extendedData = { ...data, token };
    const result = await apiSetData('reset', extendedData);
    if (result?.success) {
      showNotification('Pussword successfully restored', 'success');
      router.push('/login');
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

  const handleShowPassword = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap='1rem'>
        <Typography fontWeight='600' variant='h5' textTransform='capitalize' textAlign='center'>
          Restore password
        </Typography>

        <Stack gap='1rem'>
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
          <Stack>
            <Typography
              variant='subtitle1'
              fontWeight={600}
              component='label'
              htmlFor='email'
              mb='5px'
            >
              Password
            </Typography>
            <TextField
              id='password'
              variant='outlined'
              type={showPassword ? 'text' : 'password'}
              placeholder='*************'
              error={!!errors.password}
              helperText={errors.password ? errors.password : ''}
              fullWidth
              {...register('password')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='toggle password visibility'
                      onClick={handleShowPassword}
                    >
                      {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
          <Stack>
            <Typography
              variant='subtitle1'
              fontWeight={600}
              component='label'
              htmlFor='confirm_password'
              mb='5px'
            >
              Confirm password
            </Typography>
            <TextField
              id='confirm_password'
              variant='outlined'
              type={showPassword ? 'text' : 'password'}
              placeholder='*************'
              error={!!errors.password}
              helperText={errors.password ? errors.password : ''}
              fullWidth
              {...register('password_confirmation')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='toggle password visibility'
                      onClick={handleShowPassword}
                    >
                      {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Stack>
        <Button color='primary' variant='contained' size='large' fullWidth type='submit'>
          Restore
        </Button>
      </Stack>
    </form>
  );
}
