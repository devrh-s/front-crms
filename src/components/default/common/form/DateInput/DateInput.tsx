import { FormControl, Theme, useMediaQuery } from '@mui/material';
import { DateTimePicker, TimePicker } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';
import { useState } from 'react';
import { FieldError } from 'react-hook-form';
import CustomLabel from '../CustomLabel/CustomLabel';

type VarientType = 'date' | 'date-time' | 'time';

export interface IDateInputProps {
  label: string;
  field: any;
  format?: string;
  variant?: VarientType;
  error?: FieldError;
  style?: any;
  disabled?: boolean;
  required?: boolean;
}

export default function DateInput({
  label,
  field,
  format,
  error,
  style,
  disabled = false,
  required = false,
  variant = 'date',
}: IDateInputProps) {
  const [open, setOpen] = useState<boolean>(false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <FormControl
      variant='standard'
      className={mdDown ? 'mobile' : ''}
      sx={{
        ...style,
      }}
    >
      {variant === 'date-time' && (
        <DateTimePicker
          label={<CustomLabel label={label.split('_').join(' ')} required={required} />}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          open={open}
          {...field}
          value={dayjs(field?.value)}
          format={format}
          slotProps={{
            textField: {
              error: !!error,
              helperText: error?.message ?? '',
              onClick: () => setOpen(true),
            },
          }}
        />
      )}

      {variant === 'time' && (
        <TimePicker
          label={<CustomLabel label={label.split('_').join(' ')} required={required} />}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          ampm={false}
          format={format}
          viewRenderers={{
            hours: renderTimeViewClock,
            minutes: renderTimeViewClock,
            seconds: renderTimeViewClock,
          }}
          {...field}
          value={dayjs(field?.value, 'HH:mm:ss')}
          sx={{
            ...style,
          }}
          slotProps={{
            textField: {
              error: !!error,
              helperText: error?.message ?? '',
              onClick: () => setOpen(true),
            },
          }}
        />
      )}

      {variant === 'date' && (
        <DatePicker
          label={<CustomLabel label={label.split('_').join(' ')} required={required} />}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          disabled={disabled}
          open={open}
          {...field}
          value={field?.value ? dayjs(field.value) : null}
          format={format}
          slotProps={{
            textField: {
              error: !!error,
              helperText: error?.message ?? '',
              onClick: () => setOpen(true),
              sx: {
                '& .MuiFormHelperText-root': {
                  marginLeft: 0,
                  marginRight: 0,
                },
              },
            },
          }}
        />
      )}
    </FormControl>
  );
}
