import dayjs, { Dayjs } from 'dayjs';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import { styled } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { Button, Popover, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import { ChangeEvent, useEffect, useState } from 'react';

dayjs.extend(isBetweenPlugin);

interface CustomPickerDayProps extends PickersDayProps<Dayjs> {
  isInRange: boolean;
  isInRangeHovered: boolean;
  isStart: boolean;
  isEnd: boolean;
}
interface ICustomCalendarProps {
  filter: {
    value: IDateFilterValues;
    mode?: FilterMode;
  };
  hideSwitch?: boolean;
  label?: string;
  labelStart?: string;
  labelEnd?: string;
  handleChangeFilter: (value: FilterMode | IDateFilterValues) => void;
}
interface IError {
  isError: boolean;
  message: string;
}

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) => prop !== 'isInRange' && prop !== 'isStart' && prop !== 'isEnd',
})<CustomPickerDayProps>(({ theme, isInRange, isStart, isEnd, isInRangeHovered }) => ({
  borderRadius: 0,
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
  },
  '&:focus': {
    backgroundColor: theme.palette.primary.dark,
  },
  ...(isInRange && {
    backgroundColor: theme.palette.primary.light,
  }),
  ...(isStart && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderTopLeftRadius: '50%',
    borderBottomLeftRadius: '50%',
  }),
  ...(isEnd && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderTopRightRadius: '50%',
    borderBottomRightRadius: '50%',
  }),
  ...(isInRangeHovered && {
    backgroundColor: theme.palette.primary.light,
  }),
}));

function Day(
  props: PickersDayProps<Dayjs> & {
    startDate?: Dayjs | null;
    endDate?: Dayjs | null;
    hoveredDate?: Dayjs | null;
  }
) {
  const { day, startDate, endDate, hoveredDate, ...other } = props;

  const isInRange = startDate && endDate && day.isBetween(startDate, endDate, 'day', '[]');
  const isInRangeHovered =
    startDate &&
    !endDate &&
    hoveredDate &&
    day.isBetween(startDate, hoveredDate, 'day', '[]') &&
    startDate < hoveredDate;
  const isStart = startDate && day.isSame(startDate, 'day');
  const isEnd = endDate && day.isSame(endDate, 'day');

  return (
    <CustomPickersDay
      {...other}
      day={day}
      isInRange={!!isInRange}
      isInRangeHovered={!!isInRangeHovered}
      isStart={!!isStart}
      isEnd={!!isEnd}
    />
  );
}

export default function CustomCalendar({
  filter,
  label,
  labelStart = 'Start date',
  labelEnd = 'End date',
  handleChangeFilter,
  hideSwitch = false,
}: ICustomCalendarProps) {
  const [startDate, setStartDate] = useState<Dayjs | null>(
    filter.value?.start ? dayjs(filter.value.start) : null
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(
    filter.value?.end ? dayjs(filter.value.end) : null
  );
  const [hoveredDate, setHoveredDate] = useState<Dayjs | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeButton, setActiveButton] = useState<string>('');
  const [lastDaysValue, setLastDaysValue] = useState<number | string>('');
  const [error, setError] = useState<IError>({ isError: true, message: 'Select dates' });

  const today = dayjs();
  const isOpen = Boolean(anchorEl);

  const openPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleSubmit = () => {
    if (!error.isError) {
      handleChangeFilter({ start: startDate, end: endDate });
      setAnchorEl(null);
      setActiveButton('');
    }
  };
  const handleDelete = () => {
    setEndDate(null);
    setStartDate(null);
    setLastDaysValue('');
  };
  const handleReset = () => {
    setEndDate(filter.value?.end ? dayjs(filter.value.end) : null);
    setStartDate(filter.value?.start ? dayjs(filter.value.start) : null);
    setLastDaysValue('');
  };

  const closePopover = () => {
    setAnchorEl(null);
    handleReset();
    setLastDaysValue('');
    setActiveButton('');
  };

  const handlePresetClick = (preset: string) => {
    setActiveButton(preset);
    switch (preset) {
      case 'Today':
        setStartDate(today.startOf('day'));
        setEndDate(today.endOf('day'));
        break;
      case 'Yesterday':
        setStartDate(today.subtract(1, 'day').startOf('day'));
        setEndDate(today.subtract(1, 'day').endOf('day'));
        break;
      case 'Last_Week':
        setStartDate(today.subtract(1, 'week').startOf('week'));
        setEndDate(today.subtract(1, 'week').endOf('week'));
        break;
      case 'Last_Month':
        setStartDate(today.subtract(1, 'month').startOf('month'));
        setEndDate(today.subtract(1, 'month').endOf('month'));
        break;
      case 'This_Month':
        setStartDate(today.startOf('month'));
        setEndDate(today.endOf('month'));
        break;
      case 'This_Month':
        setStartDate(today.startOf('month'));
        setEndDate(today.endOf('month'));
        break;
      case 'Six_Months':
        setStartDate(today.subtract(6, 'months'));
        setEndDate(today.endOf('day'));
        break;
      case 'Year':
        setStartDate(today.subtract(1, 'years'));
        setEndDate(today.endOf('day'));
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (lastDaysValue && lastDaysValue !== '') {
      setStartDate(today.subtract(+lastDaysValue - 1, 'day'));
      setEndDate(today.endOf('day'));
    }
  }, [lastDaysValue]);
  useEffect(() => {
    if (filter.mode === 'exclude') {
      handleChangeFilter({
        end: null,
        start: null,
      });
      setLastDaysValue('');
      setActiveButton('');
      setEndDate(null);
      setStartDate(null);
    }
  }, [filter.mode]);
  useEffect(() => {
    setEndDate(filter.value?.end ? dayjs(filter.value.end) : null);
    setStartDate(filter.value?.start ? dayjs(filter.value.start) : null);
  }, [filter.value]);
  useEffect(() => {
    if (startDate && !endDate) {
      setError(() => ({ isError: true, message: 'Select end date' }));
    } else if (endDate && !startDate) {
      setError(() => ({ isError: true, message: 'Select start date' }));
    } else if (startDate && endDate && startDate > endDate) {
      setError(() => ({ isError: true, message: 'Start date is more than end date' }));
    } else {
      setError({ isError: false, message: '' });
    }
  }, [startDate, endDate]);
  return (
    <>
      <Stack>
        {label && <Typography>{label}</Typography>}
        <Stack flexDirection={'row'} gap='.5rem'>
          <Button
            size='large'
            disabled={filter.mode ? filter.mode === 'exclude' : false}
            variant='outlined'
            onClick={openPopover}
            sx={{
              flex: 1,
              textTransform: 'initial',
            }}
          >
            <CalendarMonthIcon />
            {filter.value?.start ? dayjs(filter.value.start).format('DD.MM.YYYY') : labelStart}
            {' — '}
            {filter.value?.end ? dayjs(filter.value.end).format('DD.MM.YYYY') : labelEnd} (
            {filter.value?.start && filter.value?.end
              ? dayjs(filter.value?.end).diff(dayjs(filter.value?.start), 'day') + 1
              : '0'}{' '}
            days)
          </Button>
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
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={closePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Stack
          sx={{
            padding: '1rem',
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack flexDirection={'row'} gap={'0.3rem'}>
              <Stack gap={'0.3rem'} justifyContent={'space-between'}>
                <Stack
                  flexDirection={'row'}
                  gap={'10px'}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <Typography color={'primary'} sx={{ fontSize: '14px', fontWeight: '500' }}>
                    LAST
                  </Typography>
                  <TextField
                    variant='outlined'
                    value={lastDaysValue}
                    size='small'
                    type='number'
                    InputProps={{ inputProps: { min: 1, max: 1000 } }}
                    sx={{ width: '55px', padding: '0 0', '& input': { padding: '2px 0 2px 5px' } }}
                    onChange={(event) => {
                      setLastDaysValue(+event.currentTarget.value);
                    }}
                  />
                  <Typography color={'primary'} sx={{ fontSize: '14px', fontWeight: '500' }}>
                    DAYS
                  </Typography>
                </Stack>
                {[
                  'Today',
                  'Yesterday',
                  'Last_Week',
                  'Last_Month',
                  'This_Month',
                  'Six_Months',
                  'Year',
                ].map((preset) => (
                  <Button
                    key={preset}
                    size='small'
                    variant={activeButton === preset ? 'contained' : 'outlined'}
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.replace(/_/g, ' ')}
                  </Button>
                ))}
                <Stack flexDirection={'row'} gap={'0.3rem'}>
                  <Tooltip title='Delete all values'>
                    <Button
                      size='small'
                      variant='outlined'
                      onClick={handleDelete}
                      startIcon={<DeleteIcon />}
                    >
                      Clear
                    </Button>
                  </Tooltip>
                  <Tooltip title='Return default value'>
                    <Button
                      size='small'
                      variant='outlined'
                      onClick={handleReset}
                      startIcon={<RestartAltIcon />}
                    >
                      Reset
                    </Button>
                  </Tooltip>
                </Stack>
              </Stack>
              <Stack>
                <Stack flexDirection={'row'}>
                  <DateCalendar
                    value={startDate}
                    onChange={(newValue, selectionState, selectedView) => {
                      newValue && setStartDate(newValue);
                    }}
                    views={['year', 'month', 'day']}
                    slots={{ day: Day }}
                    slotProps={{
                      day: (ownerState) =>
                        ({
                          startDate,
                          endDate,
                          hoveredDate,
                          onPointerEnter: () => setHoveredDate(ownerState.day),
                        }) as any,
                    }}
                  />
                  <DateCalendar
                    value={endDate}
                    onChange={(newValue, selectionState, selectedView) => {
                      newValue && setEndDate(newValue);
                    }}
                    slots={{ day: Day }}
                    disableHighlightToday
                    views={['year', 'month', 'day']}
                    slotProps={{
                      day: (ownerState) =>
                        ({
                          startDate,
                          endDate,
                          hoveredDate,
                          onPointerEnter: () => setHoveredDate(ownerState.day),
                        }) as any,
                    }}
                  />
                </Stack>
                <Stack
                  flexDirection={'row'}
                  justifyContent={'space-between'}
                  gap={'1rem'}
                  alignItems={'flex-end'}
                >
                  <Stack flexDirection={'row'} gap={'0.3rem'} alignItems={'flex-end'}>
                    <Tooltip title='Remove start date'>
                      <Button
                        size='small'
                        variant='outlined'
                        onClick={() => setStartDate(null)}
                        startIcon={<DeleteIcon />}
                      >
                        start
                      </Button>
                    </Tooltip>
                    <Tooltip title='Remove end date'>
                      <Button
                        size='small'
                        variant='outlined'
                        onClick={() => setEndDate(null)}
                        startIcon={<DeleteIcon />}
                      >
                        end
                      </Button>
                    </Tooltip>
                  </Stack>
                  <Stack
                    flexDirection={'row'}
                    justifyContent={'flex-end'}
                    gap={'1rem'}
                    alignItems={'center'}
                  >
                    <Stack flexDirection={'row'} gap={'0.2rem'}>
                      <CalendarMonthIcon />
                      {startDate ? startDate.format('DD.MM.YYYY') : labelStart} {' — '}
                      {endDate ? endDate.format('DD.MM.YYYY') : labelEnd}
                    </Stack>
                    <Typography>
                      ({startDate && endDate ? endDate.diff(startDate, 'day') + 1 : '0'} days)
                    </Typography>
                    <Stack
                      flexDirection={'row'}
                      gap={'0.5rem'}
                      sx={{
                        position: 'relative',
                      }}
                    >
                      <Button size='small' variant='outlined' onClick={closePopover}>
                        Cancel
                      </Button>
                      <Tooltip title={error.message}>
                        <Button
                          disabled={error.isError}
                          size='small'
                          variant='contained'
                          onClick={handleSubmit}
                          sx={{
                            pointerEvents: 'all !important',
                            cursor: error.isError ? 'no-drop' : 'pointer',
                          }}
                        >
                          Apply
                        </Button>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </LocalizationProvider>
        </Stack>
      </Popover>
    </>
  );
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
