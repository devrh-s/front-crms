import { Grid, Box, Card } from '@mui/material';
import Image from 'next/image';
import AuthRegister from '../auth/AuthRegister';

export default function RegisterPage() {
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
            <AuthRegister />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
