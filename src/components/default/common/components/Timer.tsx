import { Box, Chip, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

interface TimePassed {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface TimerProps {
  startDate: string;
}

const Timer = ({ startDate }: TimerProps) => {
  const calculateTimePassed = (): TimePassed => {
    const start = new Date(startDate).getTime() - 1000;
    const now = new Date().getTime();
    const difference = now - start;

    const seconds = Math.floor((difference / 1000) % 60);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds };
  };
  const [timePassed, setTimePassed] = useState<TimePassed>(calculateTimePassed());
  const formatTime = (time: number) => (time < 10 ? `0${time}` : time);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimePassed(calculateTimePassed());
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate]);

  return (
    <Chip
      variant='outlined'
      color='info'
      size='small'
      sx={{ fontSize: '18px' }}
      label={`${formatTime(timePassed.days)}:${formatTime(timePassed.days)}:${formatTime(
        timePassed.minutes
      )}:${formatTime(timePassed.seconds)}`}
    ></Chip>
  );
};

export default Timer;
