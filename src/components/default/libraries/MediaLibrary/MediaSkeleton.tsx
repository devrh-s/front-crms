import { Grid, Stack, Skeleton } from '@mui/material';

export default function MediaSkeleton() {
  return (
    <Stack
      gap='1rem'
      sx={{
        height: '100%',
      }}
    >
      <Stack flexDirection='row' justifyContent='space-between'>
        <Skeleton variant='rectangular' width={220} height={42} />
        <Stack flexDirection='row' gap='1rem'>
          <Skeleton variant='rounded' width={175} height={41} />
          <Skeleton variant='rounded' width={175} height={41} />
        </Stack>
      </Stack>
      <Stack gap='1rem'>
        <Skeleton variant='rectangular' width={100} height={24} />
        <Stack flexDirection='row' gap='1rem'>
          {[...Array(3).keys()].map((_, id) => (
            <Skeleton key={id} variant='rounded' width={240} height={60} />
          ))}
        </Stack>
      </Stack>
      <Stack gap='1rem'>
        <Skeleton variant='rectangular' width={100} height={24} />
        <Grid container spacing={2}>
          {[...Array(12).keys()].map((_, id) => (
            <Grid key={id} item xs={12} md={6} xl={3}>
              <Skeleton variant='rounded' width={'100%'} height={240} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Stack>
  );
}
