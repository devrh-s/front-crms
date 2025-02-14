'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import useNotification from '@/hooks/useNotification';
import { apiSetData } from '@/lib/fetch';
import {
  Typography,
  Button,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Link as MLink,
  alpha,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import Link from 'next/link';
import config from '@/config';

interface IFormInputs {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const { API_URL } = config;

export default function AuthRegister() {
  const { register, handleSubmit } = useForm<IFormInputs>();
  const showNotification = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<any>([]);
  const router = useRouter();

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const result = await apiSetData('registration', data);
    if (result?.success) {
      showNotification('Success. Wait for a confirmation letter in our email', 'success');
      router.push('/login');
    } else {
      const newErrors: any = {};
      for (const [key, value] of Object.entries(result.error)) {
        const [error] = value as string[];
        newErrors[key] = error;
      }
      showNotification('Something went wrong', 'error');
      setErrors(newErrors);
    }
  };

  const handleShowPassword = () => setShowPassword(!showPassword);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap='1rem'>
        <Typography
          fontWeight='600'
          variant='h4'
          textTransform='uppercase'
          textAlign='center'
          mb={1}
        >
          Register
        </Typography>

        <Stack direction='row' spacing={2}>
          <Button
            LinkComponent={MLink}
            href={`${API_URL}/google/redirect`}
            fullWidth
            size='large'
            variant='outlined'
            sx={{ borderColor: (theme) => alpha(theme.palette.grey[500], 0.16) }}
          >
            <GoogleIcon />
          </Button>
        </Stack>

        <Divider
          sx={{
            my: 3,
            color: 'primary.main',
            '&::after': {
              borderColor: 'primary.main',
            },
            '&::before': {
              borderColor: 'primary.main',
            },
          }}
        >
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            OR
          </Typography>
        </Divider>

        <Stack gap='1rem'>
          <Stack>
            <Typography
              variant='subtitle1'
              fontWeight={600}
              component='label'
              htmlFor='name'
              mb='5px'
            >
              Name
            </Typography>
            <TextField
              id='name'
              variant='outlined'
              placeholder='Full name'
              error={!!errors.name}
              required
              helperText={errors.name ? errors.name : ''}
              fullWidth
              {...register('name')}
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
              Email
            </Typography>
            <TextField
              id='email'
              variant='outlined'
              type='email'
              required
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
              htmlFor='password'
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
              required
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
              required
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
          <Typography
            component={Link}
            href='/login'
            fontWeight='500'
            mb='1rem'
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
              textAlign: 'right',
            }}
          >
            Already have an account? Sign In
          </Typography>
        </Stack>
        <Button color='primary' variant='contained' size='large' fullWidth type='submit'>
          Sign Up
        </Button>
      </Stack>
    </form>
  );
}
