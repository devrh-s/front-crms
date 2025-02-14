import { Stack, Typography, Tooltip } from '@mui/material';
import GTranslateIcon from '@mui/icons-material/GTranslate';

interface ITranslationProps {
  text: string;
  sx?: {
    [key: string]: string | number;
  };
  color?: string;
}

export default function Translation({ text, sx, color }: ITranslationProps) {
  return (
    <Tooltip title='Translation' placement='bottom'>
      <Stack flexDirection='row' justifyContent='center' alignItems='center' gap='.5rem'>
        <GTranslateIcon />
        <Typography color={color ? color : 'black'} sx={{ ...sx }}>
          {text}
        </Typography>
      </Stack>
    </Tooltip>
  );
}
