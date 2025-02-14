import { Paper, Slide, Stack, useMediaQuery, Theme } from '@mui/material';
import NavLink from './NavLink';
import { IMenuItem } from '../types';

export default function NavSubDesktop({ open, items, collapsed, closeNavSubDesk }: any) {
  const mdDowm = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  return (
    <Slide direction='right' in={!mdDowm && open} mountOnEnter unmountOnExit>
      <Paper
        sx={{
          paddingTop: '2rem',
          width: '12rem',
          padding: '2rem .5rem 0',
          height: { xs: 'calc(100dvh - 48px)', sm: 'calc(100dvh - 48px)' },
          overflow: 'hidden',
          '&:hover': {
            overflow: 'auto',
          },
        }}
        className='customScroll'
      >
        <Stack gap='1.05rem'>
          {items.map((item: IMenuItem) => (
            <NavLink
              key={item.id}
              icon={item.icon}
              title={item.title}
              href={item.href}
              collapsed={collapsed}
              closeNavSubDesk={closeNavSubDesk}
              black
            />
          ))}
        </Stack>
      </Paper>
    </Slide>
  );
}
