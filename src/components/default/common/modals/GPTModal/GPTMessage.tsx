import { useState } from 'react';
import { Stack, Typography, Box, Avatar, IconButton, Tooltip } from '@mui/material';
import useUserProfile from '@/hooks/useUserProfile';
import GPTBouncingDots from './GPTBouncingDots';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import Icon from '../../components/Icon';

interface IGPTMessageProps {
  type: 'gpt' | 'client';
  text: string;
  loading: boolean;
}

export default function GPTMessage({ type, text, loading }: IGPTMessageProps) {
  const [copy, setCopy] = useState(false);
  const { userProfile } = useUserProfile();
  const handleClickCopy = () => {
    navigator.clipboard.writeText(text);
    setTimeout(() => setCopy(false), 2000);
    setCopy(true);
  };
  if (type === 'gpt')
    return (
      <Stack flexDirection='row' gap='1rem' alignItems='center' justifyContent='flex-start'>
        <Avatar>
          <Icon type='gpt' size={30} color='#000' />
        </Avatar>
        {!loading ? (
          <Stack gap='5px'>
            <Box dangerouslySetInnerHTML={{ __html: text }} />
            <Stack flexDirection='row' justifyContent='flex-start'>
              <Tooltip title='Copy'>
                <IconButton
                  size='small'
                  onClick={handleClickCopy}
                  sx={{ alignSelf: 'center' }}
                  disabled={copy}
                >
                  {copy ? (
                    <DoneAllIcon sx={{ fontSize: '1rem' }} />
                  ) : (
                    <ContentCopyIcon sx={{ fontSize: '1rem' }} />
                  )}
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        ) : (
          <GPTBouncingDots />
        )}
      </Stack>
    );
  if (type === 'client')
    return (
      <Stack flexDirection='row' justifyContent='flex-end'>
        <Stack
          flexDirection='row'
          gap='1rem'
          alignItems='center'
          sx={{
            backgroundColor: '#e8e8e880',
            padding: '.8rem  1.5rem .8rem 0.8rem',
            borderRadius: '1.2rem',
          }}
        >
          <Avatar src={userProfile?.image} />
          <Typography>{text}</Typography>
        </Stack>
      </Stack>
    );
}
