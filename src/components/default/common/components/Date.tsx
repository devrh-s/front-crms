import { Typography } from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import dayjs, { Dayjs } from 'dayjs';

interface IDate {
  date: string;
  sx?: {
    [key: string]: string | number;
  };
  format?: string;
  type?: 'date' | 'followup-date';
}

export default function CurrentDate({ date, sx, format, type = 'date' }: IDate) {
  if (!date) return;
  const convertedDate = dayjs(date).format(format ?? 'DD-MM-YYYY');
  return (
    <Typography
      sx={{
        display: 'flex',
        gap: '.2rem',
        alignItems: 'center',
        width: 'max-content',
        ...sx,
      }}
    >
      {type === 'date' ? (
        <EventAvailableIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
      ) : (
        <NotificationsNoneOutlinedIcon sx={{ color: 'rgba(0, 0, 0, 0.54)' }} />
      )}
      {convertedDate}
    </Typography>
  );
}
