import { FieldError, UseFormRegister, FieldValues } from 'react-hook-form';
import { useState } from 'react';
import { TextField, Stack, IconButton, Tooltip, InputAdornment } from '@mui/material';
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryption';
import { generate } from 'generate-password';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CustomLabel from '../CustomLabel/CustomLabel';

interface IPasswordProps {
  error?: FieldError;
  required?: boolean;
  handleChange: (value: string) => void;
  style?: {
    [key: string]: string | number;
  };
  register: ReturnType<UseFormRegister<FieldValues>>;
}

export default function Password({
  error,
  handleChange,
  style,
  register,
  required = false,
}: IPasswordProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleShowPassword = () => setShowPassword(!showPassword);
  const generatePassword = () => {
    const newPassword = generate({
      length: 12,
      numbers: true,
    });
    handleChange(newPassword);
  };
  return (
    <Stack
      sx={{
        position: 'relative',
        ...style,
      }}
    >
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
        {...register}
        error={!!error}
        helperText={error ? error?.message : ''}
        label={<CustomLabel label={'Password'} required={required} />}
        inputProps={{ autoComplete: 'new-password' }}
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
  );
}
