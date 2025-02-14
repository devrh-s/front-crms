'use client';
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuthStore } from '@/zustand/authStore';
import useNotification from '@/hooks/useNotification';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Link as MLink,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Checkbox,
  Divider,
  LinearProgress,
  alpha,
} from '@mui/material';
import Link from 'next/link';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { LoadingButton } from '@mui/lab';
import config from '@/config';

interface IFormInputs {
  email: string;
  password: string;
  remember_me: false;
}

const { API_URL } = config;

const userLogin = async (data: IFormInputs) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    return json;
  } catch (error) {
    console.log('ERROR');
    return error;
  }
};

const getUserPermissions = async (token: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-permissions`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('ERROR: ', error);
    return error;
  }
};

export default function AuthLogin() {
  const { error, loading, login, setError, setLoading } = useAuthStore();
  const [permsInProgress, setPermsInProgress] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const message = searchParams.get('message');

  const { register, handleSubmit } = useForm<IFormInputs>({
    defaultValues: {
      email: process.env.NEXT_PUBLIC_ENV !== 'production' ? 'johndoe@example.com' : '',
      password: process.env.NEXT_PUBLIC_ENV !== 'production' ? 'secret' : '',
      remember_me: false,
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    setLoading(true);
    const result = await userLogin(data);
    if (result?.success) {
      const { token, permissions, is_admin: isAdmin } = result;
      login({ permissions, isAdmin, token });
      showNotification('Successfully logged in', 'success');
    } else {
      const { message } = result;
      setError(message);
      showNotification(message, 'error');
    }
  };

  const handleShowPassword = () => setShowPassword(!showPassword);

  const handleGoogleAuth = async (token: string) => {
    setPermsInProgress(true);
    setLoading(true);
    const result = await getUserPermissions(token);
    const { data: permissions, is_admin: isAdmin } = result;

    if (permissions) {
      login({ permissions, isAdmin, token });
    }
    setPermsInProgress(false);
  };

  useEffect(() => {
    if (token) {
      handleGoogleAuth(token);
    }
    if (message) {
      showNotification(message, 'warning');
    }
  }, [token, message]);

  return (
    <>
      {permsInProgress && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%' }}>
          <LinearProgress sx={{ height: '8px' }} />
        </Box>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography
          fontWeight='600'
          variant='h4'
          textTransform='uppercase'
          textAlign='center'
          mb={1}
        >
          Login
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

        <Stack>
          <Box>
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
              error={!!error}
              helperText={error}
              disabled={loading}
              fullWidth
              {...register('email')}
            />
          </Box>
          <Box mt='25px'>
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
              type={showPassword ? 'text' : 'password'}
              variant='outlined'
              error={!!error}
              helperText={error}
              disabled={loading}
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
          </Box>
          <Stack justifyContent='space-between' direction='row' alignItems='center' my={2}>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox {...register('remember_me')} />}
                label='Remeber this Device'
              />
            </FormGroup>
            <Typography
              component={Link}
              href='/forgot'
              fontWeight='500'
              sx={{
                textDecoration: 'none',
                color: 'primary.main',
              }}
            >
              Forgot Password ?
            </Typography>
          </Stack>
        </Stack>
        <Stack gap='1rem'>
          <LoadingButton
            loading={loading}
            loadingPosition='start'
            color='primary'
            variant='contained'
            size='large'
            fullWidth
            type='submit'
          >
            Login
          </LoadingButton>
          <Typography
            component={Link}
            href='/register'
            fontWeight='500'
            mb='1rem'
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
              alignSelf: 'center',
            }}
          >
            Don&apos;t have an account yet? Sign Up
          </Typography>
        </Stack>
      </form>
    </>
  );
}
