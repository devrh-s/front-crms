import { Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface IUserAvailability {
  availability: boolean;
  text: string | undefined;
  sx?: {
    [key: string]: string | number;
  };
}

export default function UserAvailability({ availability, text, sx = {} }: IUserAvailability) {
  return (
    <div>
      <Typography
        textTransform='capitalize'
        sx={{
          display: 'flex',
          gap: '.5rem',
          fontWeight: '600',
          fontSize: '12px',
          color: availability ? 'success.main' : 'error.main',
          ...sx,
        }}
      >
        {availability ? (
          <CheckCircleIcon fontSize='small' color='success' />
        ) : (
          <CancelIcon fontSize='small' color='error' />
        )}
        {text}
      </Typography>
    </div>
  );
}
