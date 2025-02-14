'use client';
import { useRouter } from 'next/navigation';
import { Stack, Typography, Button } from '@mui/material';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  const handleBack = () => {
    // const pathname = localStorage.getItem('crm-path');
    router.push('/');
  };
  return (
    <Stack
      justifyContent='center'
      alignItems='center'
      gap='1rem'
      sx={{
        minHeight: '100dvh',
      }}
    >
      <Typography variant='h1' fontWeight={700} color='primary'>
        {typeof error?.cause === 'number' ? error.cause : '404'}
      </Typography>
      <Typography variant='h4' color='#bdbdbd'>
        {error?.message ?? 'Something went wrong'}
      </Typography>
      <Button variant='contained' onClick={handleBack}>
        Go back
      </Button>
    </Stack>
  );
}
