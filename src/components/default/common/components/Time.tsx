import { Typography } from '@mui/material';

interface ITime {
  time: string;
  fontWeight?: number;
}

export default function Time({ time, fontWeight }: ITime) {
  const [hours, minutes] = time.split(':');
  return (
    <Typography fontWeight={fontWeight ? fontWeight : 400}>
      {hours}:{minutes}
    </Typography>
  );
}
