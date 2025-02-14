import { FieldError } from 'react-hook-form';
import { Typography } from '@mui/material';
import { MuiColorInput } from 'mui-color-input';

interface IColorInputProps {
  label: string;
  field: any;
  required?: boolean;
  error?: FieldError;
  style?: any;
}

interface ICustomLabelProps {
  label: string;
  required?: boolean;
}

function CustomLabel({ label, required }: ICustomLabelProps) {
  return (
    <Typography component='span' sx={{ display: 'inline-flex', gap: '.2rem' }}>
      {label}
      {required && (
        <Typography component='span' className='MuiFormLabel-asterisk'>
          *
        </Typography>
      )}
    </Typography>
  );
}

export default function ColorInput({
  label,
  field,
  style,
  error,
  required = false,
}: IColorInputProps) {
  return (
    <MuiColorInput
      {...field}
      error={!!error}
      sx={{
        ...style,
      }}
      helperText={error ? error?.message : ''}
      // format="hex"
      label={<CustomLabel label={label} required={required} />}
    />
  );
}
