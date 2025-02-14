import { PropsWithChildren } from 'react';
import { Box } from '@mui/material';

interface ICustomErrorTooltipProps extends PropsWithChildren {
  open: boolean;
  errorText: string;
}
export default function CustomErrorTooltip({
  open,
  errorText,
  children,
}: ICustomErrorTooltipProps) {
  return (
    <Box sx={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
      <Box
        sx={{
          display: open ? 'block' : 'none',
          position: 'absolute',
          top: '0',
          right: '0',
          transform: 'translate(50%, -100%)',
          borderRadius: '8px',
          color: '#fff',
          width: 'max-content',
          cursor: 'default',
          padding: '.5rem 1rem',
          backgroundColor: (theme) => theme.palette.error.light,
        }}
      >
        {errorText}
      </Box>
      {children}
    </Box>
  );
}
