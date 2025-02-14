import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { IconButton, Typography } from '@mui/material';
import Link from 'next/link';
import { MouseEvent } from 'react';

interface ICustomLabelProps {
  label: string;
  link?: string;
  required?: boolean;
}

export default function CustomLabel({ label, link, required }: ICustomLabelProps) {
  return (
    <Typography sx={{ display: 'flex', alignItems: 'center', gap: '.2rem' }}>
      {label}
      {required && (
        <Typography
          color={required ? 'error' : 'inherit'}
          component='span'
          className='MuiFormLabel-asterisk'
        >
          *
        </Typography>
      )}
      {link && (
        <IconButton
          size='small'
          color='primary'
          LinkComponent={Link}
          href={`${link}?add-library=true`}
          target='_blank'
          onClick={(e: MouseEvent) => e.stopPropagation()}
        >
          <AddCircleOutlineIcon
            sx={{
              width: '1.5rem',
              height: '1.5rem',
            }}
          />
        </IconButton>
      )}
    </Typography>
  );
}
