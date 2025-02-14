import { useRef, useEffect } from 'react';
import { Stack } from '@mui/material';
import GPTMessage from './GPTMessage';
import type { IGPTMessage } from './types';

interface IGPTMessageListProps {
  messages: IGPTMessage[];
  loading: boolean;
}

export default function GPTMessageList({ messages, loading }: IGPTMessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <Stack
      sx={{ overflow: 'auto', padding: '0 1rem' }}
      ref={listRef}
      gap='1rem'
      className='customScroll'
    >
      {messages.map((message, index) => (
        <GPTMessage
          key={index}
          type={message.type}
          text={message.text}
          loading={index === messages.length - 1 ? loading : false}
        />
      ))}
    </Stack>
  );
}
