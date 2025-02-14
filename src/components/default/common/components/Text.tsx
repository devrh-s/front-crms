import type { ComponentPropsWithoutRef } from 'react';
import { Typography, Tooltip } from '@mui/material';

interface ITextProps extends ComponentPropsWithoutRef<'p'> {
  text: string;
  description?: string;
  sx?: any;
}

export default function Text({ text, description, sx }: ITextProps) {
  const textComponent = (
    <Typography
      sx={{
        fontSize: '14px',
        ...sx,
      }}
    >
      {text}
    </Typography>
  );
  if (description) {
    return <Tooltip title={description}>{textComponent}</Tooltip>;
  }
  return textComponent;
}
