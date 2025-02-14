'use client';
import { ReactNode } from 'react';
import { IconButton } from '@mui/material';
import { SnackbarProvider, useSnackbar } from 'notistack';
import CloseIcon from '@mui/icons-material/Close';

function SnackbarCloseButton({ snackbarKey }: any) {
  const { closeSnackbar } = useSnackbar();

  return (
    <IconButton size='small' onClick={() => closeSnackbar(snackbarKey)} sx={{ color: '#fff' }}>
      <CloseIcon fontSize='small' />
    </IconButton>
  );
}

export default function Notifications({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <SnackbarProvider
      maxSnack={10}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      action={(snackbarKey) => <SnackbarCloseButton snackbarKey={snackbarKey} />}
    >
      {children}
    </SnackbarProvider>
  );
}
