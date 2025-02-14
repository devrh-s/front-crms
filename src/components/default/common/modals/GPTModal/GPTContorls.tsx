import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Stack, IconButton, styled, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import Icon from '../../components/Icon';
import InfoIcon from '@mui/icons-material/Info';
import theme from '@/lib/theme/theme';

export const InputWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  borderRadius: '1.5rem',
  backgroundColor: '#e8e8e880',
  alignSelf: 'center',
  height: '5rem',
  overflow: 'auto',
  width: '100%',
  maxWidth: '60dvw',
  padding: '1rem',
  justifyContent: 'space-between',
}));

export const CustomInput = styled('div')(({ theme }) => ({
  display: 'block',

  wordBreak: 'break-word',
  appearance: 'none',
  overflow: 'hidden',
  flex: 1,
  height: 'auto',
  unicodeBidi: 'plaintext',
  textAlign: 'initial',
  border: 'none',
  lineHeight: 1,
  fontSize: '1rem',
  whiteSpace: 'break-word',
  userSelect: 'text',
  '&[contentEditable=true]:empty:before': {
    content: 'attr(data-placeholder)',
    opacity: '0.6',
  },
}));

export function clearSelection() {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  if (selection.removeAllRanges) {
    selection.removeAllRanges();
  } else if (selection.empty) {
    selection.empty();
  }
}

export function focusEditableElement(element: any, force: any) {
  if (!force && element === document.activeElement) {
    return;
  }

  const selection = window.getSelection();
  const range = document.createRange();
  const lastChild = element.lastChild || element;

  if (!lastChild || !lastChild.nodeValue) {
    element.focus();

    return;
  }

  range.selectNodeContents(lastChild);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
}

interface IGPTControls {
  loading: boolean;
  sendMessage: (newMessage: string) => void;
}

export default function GPTContorls({ loading, sendMessage }: IGPTControls) {
  const [focused, setFocused] = useState(true);

  const focusTimer = useRef<any>();
  const inputRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  useEffect(() => {
    focusTimer.current = setTimeout(() => {
      focusEditableElement(inputRef.current, true);
    }, 500);

    return () => {
      clearTimeout(focusTimer.current);
    };
  }, []);

  const handlePaste = (event: any) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    const selection = window.getSelection();
    if (selection) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      clearSelection();
      focusEditableElement(inputRef.current, true);
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    const newMessage = inputRef?.current?.innerText.trim();
    if (event.key === 'Enter' && inputRef.current && newMessage && !loading) {
      if (newMessage) {
        sendMessage(newMessage);
      }
      inputRef.current.innerText = '';
    }
  };

  const handleSendMessage = () => {
    if (inputRef?.current && !loading) {
      const newMessage = inputRef.current.innerText.trim();
      if (newMessage) {
        sendMessage(newMessage);
      }
      inputRef.current.innerText = '';
    }
  };

  return (
    <Stack gap='5px'>
      <InputWrapper>
        <CustomInput
          data-placeholder='Message chat GPT'
          contentEditable
          onFocus={handleFocus}
          onBlur={handleBlur}
          ref={inputRef}
          role='textbox'
          dir='auto'
          tabIndex={0}
          onKeyDown={handleKeyPress}
          onPaste={handlePaste}
        />
        <IconButton
          onClick={handleSendMessage}
          color='secondary'
          sx={{ alignSelf: 'center' }}
          disabled={loading}
        >
          <Icon type='gpt' color={theme.palette.secondary.main} size={30} />
        </IconButton>
      </InputWrapper>
      <Stack flexDirection='row' gap='5px' justifyContent='center' sx={{ color: grey[400] }}>
        <InfoIcon />
        <Typography component='span'>
          The last saved response received from Chat GPT will be automatically saved.
        </Typography>
      </Stack>
    </Stack>
  );
}
