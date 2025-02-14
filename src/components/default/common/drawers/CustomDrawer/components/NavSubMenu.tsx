import NavLink from './NavLink';
import { IMenuItem } from '../types';
import { forwardRef, useState, MutableRefObject } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Stack, Link, IconButton, useMediaQuery, Tooltip, Theme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ICustomLink {
  handleToggleMenu: () => void;
  isActive: boolean;
  children: any;
}

const CustomLink = ({ handleToggleMenu, isActive, children }: ICustomLink) => (
  <Link
    sx={{
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '.5rem',
      color: (theme: any) =>
        isActive ? theme.palette.secondary.main : theme.palette.menu.contrastText,
      '&:hover': {
        color: (theme) => theme.palette.secondary.main,
      },
    }}
    underline='none'
    onClick={handleToggleMenu}
  >
    {children}
  </Link>
);

interface INavSubMenu extends IMenuItem {
  menuWidth: number;
  collapsed: boolean;
  toggleNavSubDesk: (name: string, items: IMenuItem[]) => void;
}

const NavSubMenu = forwardRef(function NavSubMenu(
  { title, icon, menuWidth, toggleNavSubDesk, collapsed, childItems = [] }: INavSubMenu,
  ref
) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const pathname = usePathname();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const isActive = childItems?.some(
    (item) => item.href !== '/' && pathname?.match(new RegExp(`^${item.href}(/\n)*`))
  );

  const handleToggleMenu = () => {
    if (mdDown) {
      setAnchorEl((ref as MutableRefObject<HTMLElement>).current);
    } else {
      toggleNavSubDesk(title as string, childItems);
    }
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  return (
    <>
      {!collapsed ? (
        <CustomLink handleToggleMenu={handleToggleMenu} isActive={isActive}>
          {icon}&nbsp;{title}
        </CustomLink>
      ) : (
        <Tooltip title={title} placement='right-end'>
          <div>
            <CustomLink handleToggleMenu={handleToggleMenu} isActive={isActive}>
              {icon}
            </CustomLink>
          </div>
        </Tooltip>
      )}
      <Menu
        id='basic-menu'
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleCloseMenu}
        MenuListProps={{
          onMouseLeave: handleCloseMenu,
          component: 'div',
          sx: {
            display: mdDown ? 'flex' : 'none',
            padding: '1rem',
            height: 'inherit',
            fontSize: '1.2rem',
          },
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            top: '0 !important',
            borderRadius: 0,
            minWidth: menuWidth,
            maxHeight: '100dvh',
            left: '0 !important',
            overflow: 'auto',
          },
        }}
      >
        <IconButton
          color='error'
          onClick={handleCloseMenu}
          sx={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
          }}
        >
          <CloseIcon />
        </IconButton>
        <Stack gap='2rem' sx={{ paddingTop: '2rem' }}>
          {childItems?.map((item) => (
            <NavLink
              key={item.id}
              icon={item.icon}
              title={item.title}
              href={item.href}
              collapsed={collapsed}
              black
            />
          ))}
        </Stack>
      </Menu>
    </>
  );
});

export default NavSubMenu;
