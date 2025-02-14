import { Typography } from '@mui/material';
interface IPriorityProps {
  priority: string;
  sx?: {
    [key: string]: string | number;
  };
  color?: string;
}

export default function Priority({ priority, sx, color }: IPriorityProps) {
  return (
    <Typography
      color={color ? color : 'black'}
      sx={{
        fontSize: '14px',
        ...sx,
      }}
    >
      {priority}
    </Typography>
  );
}
