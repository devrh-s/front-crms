import { Box, Paper, Typography } from '@mui/material';

interface ITotalBlockProps {
  icon: any;
  title: string;
  total: number;
}

export default function TotalBlock({ icon, title, total }: ITotalBlockProps) {
  return (
    <Paper
      elevation={1}
      sx={{
        display: 'flex',
        padding: '8px',
        flex: 1,
        border: '1px solid #b1aaaa',
        gap: 1.5,
        alignItems: 'center',
      }}
    >
      {icon}
      <Box>
        <Typography variant='h6' color={'primary'}>
          {title}
        </Typography>
        <Typography fontSize={'18px'} fontWeight={'bold'}>
          {total}
        </Typography>
      </Box>
    </Paper>
  );
}
