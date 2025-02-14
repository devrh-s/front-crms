import { useRef, useState, useCallback, useEffect } from 'react';
import { Stack, Button, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';

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

export default function AddImage({ value, text, onChange }: any) {
  const fileInputRef = useRef<any>(null);
  const [fileURL, setFileURL] = useState<any>('');

  useEffect(() => {
    if (typeof value === 'string') {
      setFileURL(value);
      return;
    }
    if (value?.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = function (e) {
        setFileURL(e.target?.result);
      };
      reader.readAsDataURL(value);
    }
    if (value) {
      setFileURL(URL.createObjectURL(value));
    }
  }, [value]);

  return (
    <Stack flexDirection='row' gap='2rem' justifyContent='center'>
      {fileURL && (
        <Stack
          sx={{
            position: 'relative',
            border: (theme) => `1px dotted ${theme.palette.primary.main}`,
            padding: '1.5rem',
          }}
        >
          <IconButton
            color='error'
            size='small'
            onClick={() => onChange('')}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
            }}
          >
            <CloseIcon fontSize='small' />
          </IconButton>
          <Image src={fileURL} height={104} width={104} alt='New user image' />
        </Stack>
      )}
      <Button
        component='label'
        role={undefined}
        variant='outlined'
        tabIndex={-1}
        sx={{
          display: 'flex',
          alidnItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          width: '9.5rem',
          minHeight: '9.5rem',
          border: '1px dotted',
          '&:hover': {
            border: '1px dotted',
          },
        }}
      >
        <AddIcon />
        {text}
        <VisuallyHiddenInput
          type='file'
          ref={fileInputRef}
          onChange={(event) => {
            if (fileInputRef.current && event.target.files?.[0]) {
              onChange(event.target.files[0]);
              fileInputRef.current.value = null;
            }
          }}
          multiple
        />
      </Button>
    </Stack>
  );
}
