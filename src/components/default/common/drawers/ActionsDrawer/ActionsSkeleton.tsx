import { Stack, Typography, Skeleton } from '@mui/material';

export default function ActionsSkeleton() {
  return (
    <Stack gap='1.5rem' sx={{ height: '100%' }}>
      <Stack flexDirection='row' justifyContent='space-between' sx={{ color: '#909090' }}>
        <Stack flexDirection='row' gap='.5rem'>
          <Typography>ID:</Typography>
          <Skeleton variant='text' sx={{ fontSize: '.75rem', width: 60 }} />
        </Stack>
        <Stack flexDirection='row' gap='.5rem'>
          <Typography>Created By:</Typography>
          <Skeleton variant='text' sx={{ fontSize: '.75rem', width: 60 }} />
        </Stack>
        <Stack flexDirection='row' gap='.5rem'>
          <Typography>ID:</Typography>
          <Skeleton variant='text' sx={{ fontSize: '.75rem', width: 60 }} />
        </Stack>
      </Stack>
      <Skeleton variant='rounded' width={'100%'} height={40} />
      <Skeleton variant='rounded' width={'100%'} height={40} />
      <Skeleton variant='rounded' width={'100%'} height={40} />
      <Skeleton variant='rounded' width={'100%'} height={40} />
      <Skeleton variant='rounded' width={'100%'} height={40} />
      <Skeleton variant='rounded' width={'100%'} height={40} />
      <Skeleton variant='rounded' width={'100%'} height={200} />
      <Skeleton variant='rounded' width={386} height={42} sx={{ mt: 'auto' }} />
    </Stack>
  );
}
