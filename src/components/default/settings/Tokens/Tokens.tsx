'use client';
import { apiGetData } from '@/lib/fetch';
import { Box } from '@mui/material';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import EmptyTokens from './EmptyTokens';
import TokensSettings from './TokensSettings';
import TokensTable from './TokensTable';
import { TokensVariant } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';
import { setEditsData } from '@/redux/slices/editsSlice';

export default function Tokens() {
  const [tokensVariant, setTokensVariant] = useState<TokensVariant>(TokensVariant.TABLE);
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);

  const { isFetching, isError, data } = useQuery({
    queryKey: [''],
    queryFn: async () => {
      return await apiGetData('tokens');
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (tokensVariant === TokensVariant.SETTINGS) {
      setTokensVariant(TokensVariant.SETTINGS);
      return;
    }

    if (data?.data?.length === 0) {
      setTokensVariant(TokensVariant.EMPTY);
    } else {
      setTokensVariant(TokensVariant.TABLE);
    }
  }, [data, tokensVariant]);

  useEffect(() => {
    if (data) {
      const { count_edits: countEdits, entity_block_id: entityBlockId } = data;
      dispatch(
        setEditsData({
          countEdits,
          entityBlockId,
        })
      );
      setGuidesData({ entityBlockId });
    }
  }, [data]);

  const ActivePage = () => {
    switch (tokensVariant) {
      case TokensVariant.EMPTY:
        return <EmptyTokens setTokensVariant={setTokensVariant} />;
      case TokensVariant.TABLE:
        return <TokensTable setTokensVariant={setTokensVariant} />;
      case TokensVariant.SETTINGS:
        return <TokensSettings setTokensVariant={setTokensVariant} />;
    }
  };

  return (
    <Box display={'flex'} flexDirection={'column'} gap={'1rem'}>
      {ActivePage()}
    </Box>
  );
}
