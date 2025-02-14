import { Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { FieldErrors } from 'react-hook-form';
interface IFormInputs {
  name: string;
  hours_planned: string;
  checklist_items: number[] | [];
  reason: string;
}
interface ICustomTimePickerProps {
  errors: FieldErrors<IFormInputs>;
  setValue: any;
  value: string;
  isLoading: boolean;
  isDraft?: boolean;
}

export default function CustomTimePicker({
  errors,
  setValue,
  value,
  isLoading,
  isDraft,
}: ICustomTimePickerProps) {
  const [hours, setHours] = useState<number | string>(0);
  const [minutes, setMinutes] = useState<number | string>(0);
  const [seconds, setSeconds] = useState<number | string>(0);

  useEffect(() => {
    if (hours !== 0 || minutes !== 0 || seconds !== 0) {
      setValue(
        'hours_planned',
        `${+hours < 10 ? `0${hours}` : hours}:${+minutes < 10 ? `0${minutes}` : minutes}:${
          +seconds < 10 ? `0${seconds}` : seconds
        }`
      );
    }
  }, [hours, minutes, seconds]);
  useEffect(() => {
    if (value) {
      setHours(+value.slice(0, 2));
      setMinutes(+value.slice(3, 5));
      setSeconds(+value.slice(6, 8));
    }
  }, [value]);

  return (
    <Stack gap={'0.2rem'}>
      <Typography
        color={errors.hours_planned ? 'error' : 'rgba(0, 0, 0, 0.6)'}
        sx={{
          fontSize: '12px',
        }}
      >
        Hours planned{' '}
        <Typography
          component={'span'}
          sx={{
            fontSize: '12px',
            color: '#e53935',
          }}
        >
          {!isDraft && '*'}
        </Typography>
      </Typography>
      <Stack flexDirection={'row'} alignItems={'center'} gap={'0.2rem'}>
        <TextField
          disabled={isLoading}
          variant='outlined'
          value={hours}
          type='number'
          error={!!errors.hours_planned}
          size='small'
          onChange={(e) => setHours(e.target.value)}
          InputProps={{
            inputProps: {
              min: 0,
              max: 99,
            },
          }}
          sx={{
            width: '80px',
          }}
        />
        :
        <TextField
          disabled={isLoading}
          variant='outlined'
          type='number'
          value={minutes}
          error={!!errors.hours_planned}
          size='small'
          onChange={(e) => setMinutes(e.target.value)}
          InputProps={{
            inputProps: {
              min: 0,
              max: 59,
            },
          }}
          sx={{
            width: '80px',
          }}
        />
        :
        <TextField
          disabled={isLoading}
          variant='outlined'
          type='number'
          value={seconds}
          error={!!errors.hours_planned}
          size='small'
          onChange={(e) => setSeconds(e.target.value)}
          InputProps={{
            inputProps: {
              min: 0,
              max: 59,
            },
          }}
          sx={{
            width: '80px',
          }}
        />
      </Stack>
      {errors.hours_planned && (
        <Typography
          color={'error'}
          sx={{
            fontSize: '12px',
          }}
        >
          {errors.hours_planned.message}
        </Typography>
      )}
    </Stack>
  );
}
