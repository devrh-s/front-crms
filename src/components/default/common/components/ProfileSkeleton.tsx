import { Stack, Skeleton } from '@mui/material';

export default function ProfileSkeleton() {
  return (
    <>
      <Stack flexDirection='row' alignItems='flex-end' padding='1rem 0 0' gap='0.5rem'>
        <Skeleton variant='rounded' width={150} height={40} />
        <Skeleton variant='rounded' width={150} height={30} />
      </Stack>
      <Stack
        sx={{
          padding: '1rem',
        }}
      >
        <Skeleton variant='rounded' width='100%' height={100} />
      </Stack>
    </>
  );
}
