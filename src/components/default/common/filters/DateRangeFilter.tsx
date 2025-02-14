import { Stack, Switch, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { ChangeEvent, useEffect, useState } from 'react';

interface IDateRangeFilterProps {
  labelStart?: string;
  labelEnd?: string;
  hideSwitch?: boolean;
  filter: {
    value: IDateFilterValues;
    mode?: FilterMode;
  };
  label?: string;
  handleChangeFilter: (value: FilterMode | IDateFilterValues) => void;
}

interface IError {
  start: string;
  end: string;
}

const CustomSwitch = styled(Switch)(({ theme }) => ({
  padding: 8,
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
    },
    '&::before': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
      left: 12,
    },
    '&::after': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: 16,
    height: 16,
    margin: 2,
  },
}));

export default function DateRangeFilter({
  labelStart = 'Start date',
  labelEnd = 'End date',
  hideSwitch = false,
  label,
  filter,
  handleChangeFilter,
}: IDateRangeFilterProps) {
  const [openStartDate, setOpenStartDate] = useState<boolean>(false);
  const [openEndDate, setOpenEndDate] = useState<boolean>(false);
  const [error, setError] = useState<IError>({ start: '', end: '' });
  const value = filter.value as IDateFilterValues;

  useEffect(() => {
    if (filter.mode === 'exclude') {
      handleChangeFilter({
        end: null,
        start: null,
      });
    }
  }, [filter.mode]);

  useEffect(() => {
    if (filter?.value?.start && !filter?.value?.end) {
      setError((prev) => ({ ...prev, end: 'Invalid value' }));
    } else if (filter?.value?.end && !filter?.value?.start) {
      setError((prev) => ({ ...prev, start: 'Invalid value' }));
    } else if (
      filter?.value?.start &&
      filter?.value?.end &&
      filter?.value?.start > filter?.value?.end
    ) {
      setError((prev) => ({ ...prev, start: 'Invalid value' }));
    } else {
      setError({ start: '', end: '' });
    }
  }, [filter.value]);

  return (
    <Stack>
      {label && <Typography>{label}</Typography>}
      <Stack flexDirection='row' gap='.5rem' alignItems='center'>
        <DemoContainer components={['DatePicker', 'DatePicker']} sx={{ overflow: 'visible' }}>
          <Stack flexDirection='row' gap='5px' alignItems='center'>
            <Stack sx={{ position: 'relative' }}>
              <DatePicker
                label={labelStart}
                onOpen={() => setOpenStartDate(true)}
                onClose={() => setOpenStartDate(false)}
                open={openStartDate}
                value={filter?.value?.start}
                format={'DD-MM-YY'}
                disabled={filter.mode === 'exclude'}
                onChange={(newDate) =>
                  handleChangeFilter({
                    ...value,
                    start: newDate,
                  })
                }
                slotProps={{
                  textField: {
                    onClick: () => setOpenStartDate(true),
                    error: !!error?.start,
                  },
                }}
              />
              {error?.start && (
                <Typography
                  color='error'
                  sx={{ position: 'absolute', left: '5px', bottom: '-1.5rem' }}
                >
                  {error.start}
                </Typography>
              )}
            </Stack>
            -
            <Stack sx={{ position: 'relative' }}>
              <DatePicker
                label={labelEnd}
                onOpen={() => setOpenEndDate(true)}
                onClose={() => setOpenEndDate(false)}
                open={openEndDate}
                format={'DD-MM-YY'}
                value={filter?.value?.end}
                disabled={filter.mode === 'exclude'}
                onChange={(newDate) =>
                  handleChangeFilter({
                    ...value,
                    end: newDate,
                  })
                }
                slotProps={{
                  textField: {
                    onClick: () => setOpenEndDate(true),
                    error: !!error?.end,
                  },
                }}
              />
              {error?.end && (
                <Typography
                  color='error'
                  sx={{ position: 'absolute', left: '5px', bottom: '-1.5rem' }}
                >
                  {error.end}
                </Typography>
              )}
            </Stack>
          </Stack>
        </DemoContainer>
        {filter.mode && !hideSwitch && (
          <CustomSwitch
            checked={filter.mode === 'standard' ? true : false}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChangeFilter(event.target.checked ? 'standard' : 'exclude')
            }
          />
        )}
      </Stack>
    </Stack>
  );
}
