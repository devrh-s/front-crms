'use client';
import { Box, Button, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { TokensVariant } from './types';

interface IEmptyTokensProps {
  setTokensVariant: Dispatch<SetStateAction<TokensVariant>>;
}

export default function EmptyTokens({ setTokensVariant }: IEmptyTokensProps) {
  return (
    <Box
      height={'100%'}
      display={'flex'}
      flexDirection={'column'}
      gap={'0.5rem'}
      alignItems={'center'}
      justifyContent={'center'}
      minHeight={'30vh'}
    >
      <Typography>Add your first API token</Typography>
      <Button variant='contained' onClick={() => setTokensVariant(TokensVariant.SETTINGS)}>
        Add new API token
      </Button>
    </Box>
  );
}
