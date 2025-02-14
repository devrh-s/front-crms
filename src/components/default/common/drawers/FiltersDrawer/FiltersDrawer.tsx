import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { Button, Drawer, IconButton, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';

interface IFiltersDrawerProps {
  visible: boolean;
  title?: string;
  children?: ReactNode | ReactNode[];
  clearFilters: () => void;
  handleSetFilters: (filters: object) => void;
  toggleFilters: (value: boolean) => () => void;
  handleApplyFilters: () => void;
  closeAfterApply?: boolean;
}

export default function FiltersDrawer({
  visible,
  title,
  children,
  toggleFilters,
  clearFilters,
  handleSetFilters,
  handleApplyFilters,
  closeAfterApply,
}: IFiltersDrawerProps) {
  const [toogleClear, setToogleClear] = useState<boolean>(false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const handleResetFilters = () => {
    handleSetFilters({});
    clearFilters();
    setToogleClear(true);
  };

  const handleClickApply = () => {
    handleApplyFilters();
    if (closeAfterApply) {
      toggleFilters(false)();
    }
  };

  useEffect(() => {
    const body = document.querySelector('body') as HTMLElement;
    if (visible) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = '';
    }
  }, [visible]);

  useEffect(() => {
    if (toogleClear) {
      handleApplyFilters();
      setToogleClear(false);
    }
  }, [toogleClear]);

  return (
    <Drawer
      anchor='right'
      open={visible}
      onClose={toggleFilters(false)}
      sx={{
        '& .MuiPaper-root': {
          overflow: 'unset',
        },
      }}
      ModalProps={{
        disableScrollLock: true,
      }}
    >
      <Stack
        gap='1rem'
        sx={{
          width: mdDown ? 375 : 450,
          padding: mdDown ? '4rem 2rem 0' : '1.5rem 2rem 0',
          position: 'relative',
          overflowY: 'auto',
          paddingBottom: '1rem',
        }}
        role='presentation'
      >
        {mdDown && (
          <IconButton
            color='error'
            onClick={toggleFilters(false)}
            sx={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              zIndex: 100,
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
        {title && (
          <Typography
            sx={{
              fontSize: '1.2rem',
              fontWeight: 500,
            }}
          >
            {title}
          </Typography>
        )}
        <Stack
          gap='1.5rem'
          sx={{
            padding: '2rem 0 0',
          }}
        >
          {children}
        </Stack>
        <Stack
          flexDirection={'row'}
          justifyContent='center'
          gap='1rem'
          sx={{ paddingTop: '.5rem' }}
        >
          <Button
            startIcon={<FilterAltIcon />}
            color='primary'
            variant='contained'
            onClick={handleClickApply}
            sx={{ width: '50%' }}
          >
            Apply
          </Button>
          <Button
            startIcon={<FilterAltOffIcon />}
            variant='outlined'
            onClick={handleResetFilters}
            sx={{ width: '50%' }}
          >
            Reset
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
