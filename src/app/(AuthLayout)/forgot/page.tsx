import { Grid, Box, Card } from '@mui/material';
import Image from 'next/image';
import AuthForgot from '../auth/AuthForgot';

export default function LoginPage() {
  return (
    <Box component='main'>
      <Grid container spacing={0} justifyContent='center' sx={{ height: '100vh' }}>
        <Grid
          item
          xs={12}
          sm={12}
          lg={4}
          xl={3}
          display='flex'
          justifyContent='center'
          alignItems='center'
        >
          <Card elevation={2} sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: '500px' }}>
            <Box display='flex' alignItems='center' justifyContent='center'>
              <Image src='/Logo.svg' width={100} height={100} alt='SRM Logo' />
            </Box>
            <AuthForgot />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
