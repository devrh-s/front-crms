import { DragEvent, useRef } from 'react';
import { Stack, styled, Typography } from '@mui/material';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

const AnimatedBackground = styled('div')({
  '@keyframes move': {
    '100%': {
      backgroundPosition: '0% 0%',
    },
  },
  width: '100%',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  backgroundImage:
    'repeating-linear-gradient(-45deg, transparent, transparent 1rem, #e0e0e0 1rem, #e0e0e0 2rem);',
  backgroundPosition: '100% 100%',
  backgroundSize: '200% 200%',
  zIndex: -1,
  opacity: 0,
  transition: 'opacity .2s ease-in-out',
  animation: 'move 10s linear infinite;',
});

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function DownloadArea({ value, error, onChange }: any) {
  const bgRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (bgRef.current) {
        bgRef.current.style.opacity = '0';
      }
      onChange(files?.[0]);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (bgRef.current) {
      bgRef.current.style.opacity = '1';
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (bgRef.current) {
      bgRef.current.style.opacity = '0';
    }
  };

  return (
    <Stack
      component='label'
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      justifyContent='center'
      alignItems='center'
      sx={{
        width: '100%',
        height: '8rem',
        position: 'relative',
        border: '1px solid grey',
        borderRadius: '.5rem',
        cursor: 'pointer',
        ':hover div': {
          opacity: '1 !important',
        },
      }}
    >
      <AnimatedBackground ref={bgRef} />
      {value ? (
        <Stack alignItems='center'>
          <CloudDownloadIcon sx={{ fontSize: '3rem' }} />
          <Typography>Change file</Typography>
        </Stack>
      ) : (
        <Stack alignItems='center'>
          <CloudDownloadOutlinedIcon sx={{ fontSize: '3rem' }} />
          <Typography>Choose a file</Typography>
        </Stack>
      )}
      <VisuallyHiddenInput
        value={value?.fileName ?? ''}
        onChange={(e) => onChange(e.target?.files?.[0])}
        type='file'
      />
      {error && (
        <Typography
          sx={{
            color: (theme) => theme.palette.error.main,
            position: 'absolute',
            left: 0,
            top: '102%',
            fontSize: '14px',
          }}
        >
          {error}
        </Typography>
      )}
    </Stack>
  );
}
