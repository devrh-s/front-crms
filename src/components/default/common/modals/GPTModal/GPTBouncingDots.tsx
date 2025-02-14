import { styled } from '@mui/material';

const DotsWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignSelf: 'flex-end',
  justifyContent: 'center',
  '& > div:nth-child(2)': {
    animationDelay: '0.2s',
  },
  '& > div:nth-child(3)': {
    animationDelay: '0.4s',
  },
}));

const Dot = styled('div')(({ theme }) => ({
  width: '.8rem',
  height: '.8rem',
  margin: '3px 6px',
  borderRadius: '50%',
  backgroundColor: '#a3a1a1',
  opacity: 1,
  animation: 'bouncing-loader 0.6s infinite alternate',
  '@keyframes bouncing-loader': {
    to: {
      opacity: '0.1',
      transform: 'translateY(-.8rem)',
    },
  },
}));

export default function GPTBouncingDots() {
  return (
    <DotsWrapper>
      <Dot></Dot>
      <Dot></Dot>
      <Dot></Dot>
    </DotsWrapper>
  );
}
