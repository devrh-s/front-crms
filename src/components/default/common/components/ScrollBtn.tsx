'use client';
import { useState, useEffect } from 'react';
import { Fab, Grow } from '@mui/material';
import UpIcon from '@mui/icons-material/KeyboardArrowUp';

export default function ScrollBtn() {
  const [isBtnVisible, setIsBtnVisible] = useState(false);
  const handleScroll = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    setIsBtnVisible(scrollY > window.innerHeight * 2);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    isBtnVisible && (
      <Grow in>
        <Fab sx={{ position: 'fixed', bottom: '2rem', right: '2rem' }} onClick={scrollToTop}>
          <UpIcon />
        </Fab>
      </Grow>
    )
  );
}
