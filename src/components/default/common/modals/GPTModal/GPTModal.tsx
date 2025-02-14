import { useState, useEffect } from 'react';
import { Box, Modal, useMediaQuery, IconButton, Theme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GPTMessageList from './GPTMessageList';
import GPTContorls from './GPTContorls';
import { useMutation } from '@tanstack/react-query';
import useNotification from '@/hooks/useNotification';
import { apiSetData } from '@/lib/fetch';
import type { IGPTMessage } from './types';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  height: '100dvh',
  bgcolor: 'background.paper',
  borderRadius: '4px',
  boxShadow: 24,
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
  gap: '1.5rem',
  padding: '3rem 2rem 1rem',
  pb: '2rem',
};

interface IGPTModalProps {
  open: boolean;
  clear?: boolean;
  answer: string;
  link: string;
  thread_id: string;
  handleClose: (answer: string) => void;
}

export const defaultGPTModal = {
  open: false,
  answer: '',
  link: '',
  thread_id: '',
};

export default function GPTModal({
  open,
  answer,
  link,
  thread_id,
  clear,
  handleClose,
}: IGPTModalProps) {
  const showNotification = useNotification();
  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const [messages, setMessages] = useState<IGPTMessage[]>([]);
  const mutation = useMutation({
    mutationFn: (data: any) => apiSetData('openai/modify-message', data),
    onSuccess: (result) => {
      const { answer } = result;
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { text: answer, type: 'gpt' };
        return newMessages;
      });
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      showNotification(`${status}: ${error ?? 'Something went wrong'}`, 'error');
    },
  });

  const sendMessage = (newMessage: string) => {
    setMessages((prev) => [
      ...prev,
      { text: newMessage, type: 'client' },
      { text: '', type: 'gpt' },
    ]);
    mutation.mutate({ message: newMessage, thread_id, link });
  };

  useEffect(() => {
    if (answer) {
      setMessages((prev) => [...prev, { text: answer, type: 'gpt' }]);
    }
  }, [answer]);

  useEffect(() => {
    if (clear) {
      setMessages([]);
    }
  }, [clear]);

  const handleModalClose = () => {
    const lastMessage = messages[messages.length - 1];
    handleClose(lastMessage?.text ?? '');
  };

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={{ ...style, width: !smDown ? '80%' : '100%' }}>
        <IconButton
          color='error'
          size='small'
          onClick={handleModalClose}
          sx={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
          }}
        >
          <CloseIcon fontSize='small' />
        </IconButton>
        <GPTMessageList messages={messages} loading={mutation.isPending} />
        <GPTContorls sendMessage={sendMessage} loading={mutation.isPending} />
      </Box>
    </Modal>
  );
}
