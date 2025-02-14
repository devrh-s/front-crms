import CustomBreadcrumbs from '@/components/default/common/UI/CustomBreadcrumbs/CustomBreadcrumbs';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useActions from '@/hooks/useActions';
import useUserProfile from '@/hooks/useUserProfile';
import { apiDeleteData, apiGetData } from '@/lib/fetch';
import { IRootState } from '@/redux/store';
import { useAuthStore } from '@/zustand/authStore';
import { useCustomizerStore } from '@/zustand/customizerStore';
import { useGuidesStore } from '@/zustand/guidesStore';
import { Menu as MenuIcon, Notifications } from '@mui/icons-material';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import EditNoteIcon from '@mui/icons-material/EditNote';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Theme,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion, Variants } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import AppEdits from './components/AppEdits';
import AppGuides from './components/AppGuides/AppGuides';
import AppNotifications from './components/AppNotifications';
import NavGroup from './components/NavGroup';
import NavLink from './components/NavLink';
import NavSubDesktop from './components/NavSubDesktop';
import NavSubMenu from './components/NavSubMenu';
import menuitems from './MenuItems';
import { IMenuItem, INavSubDesk } from './types';

const envExceptionsData = {
  production: ['media'],
  development: [],
};

const itemVariants: Variants = {
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { type: 'spring', delay: i * 0.2 },
  }),
  hidden: { opacity: 0, y: 10 },
};

export default function ResponsiveDrawer({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const { echo } = useContext(SocketContext);
  const {
    sidebar: { width: sidebarWidth },
    changeSidebarWidth,
  } = useCustomizerStore();
  const profilePageName = useSelector((state: IRootState) => state.profilePage.name);
  const { userProfile } = useUserProfile();
  const { isAdmin, permissionNames, logout } = useAuthStore();
  const { countEdits, entityBlockId, progressableType } = useSelector(
    (state: IRootState) => state.edits
  );
  const entityBlockIdForGuides = useGuidesStore((store) => store.entityBlockId);
  const progressableTypeForGuides = useGuidesStore((store) => store.progressableType);

  const router = useRouter();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const collapsed = open && !mdDown;
  const [navSubDesk, setNavSubDesk] = useState<INavSubDesk>({
    open: false,
    name: '',
    items: [],
  });
  const [isClosing, setIsClosing] = useState(false);
  const drawerRef = useRef<HTMLElement | null>(null);
  const [anchorMenuEl, setAnchorMenuEl] = useState<null | HTMLElement>(null);
  const [anchorEditsEl, setAnchorEditsEl] = useState<null | HTMLElement>(null);
  const [anchorNotificationsEl, setAnchorNotificationsEl] = useState<null | HTMLElement>(null);
  const { actionsData, handleActions } = useActions();
  const {
    data: notificationsData,
    refetch,
    fetchNextPage: fetchNextNotification,
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: async ({ pageParam }) => {
      const response = await apiGetData('notifications?page=' + pageParam);
      return {
        data: response?.data,
        count: response?.unreadNotificationsCount,
        nextCursor: pageParam + 1,
      };
    },
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  });

  const notifications = useMemo(() => {
    if (!notificationsData) return { data: [], count: 0 };
    const count = notificationsData?.pages[0]?.count;
    const data = notificationsData.pages.flatMap((page) => page.data);
    return {
      data,
      count,
    };
  }, [notificationsData]);

  const openNotifications = Boolean(anchorNotificationsEl);
  const openEdits = Boolean(anchorEditsEl);
  const openMenu = Boolean(anchorMenuEl);
  const visibleMenuItems = useMemo(() => {
    if (!permissionNames) return [];
    const envExceptions: string[] =
      envExceptionsData[config.env as keyof typeof envExceptionsData] ?? [];
    const uniquePermissionNames = permissionNames.filter(
      (perm) => !envExceptions.includes(perm.toLowerCase())
    );
    return menuitems
      .filter((item) => {
        const title = item.title?.toLowerCase()!;
        if (isAdmin || title === 'dashboard') {
          return true;
        }
        return uniquePermissionNames.includes(title);
      })
      .map((item) => ({
        ...item,
        childItems: item.childItems?.filter((el) => {
          const title = el.title?.toLowerCase()!;
          if (isAdmin && !envExceptions.includes(title)) return true;
          return uniquePermissionNames.includes(title);
        }),
      }));
  }, [isAdmin, permissionNames]);

  const [expanded, setExpanded] = useState<Array<boolean>>(
    visibleMenuItems.map((elem) =>
      elem.childItems?.some(
        (item) => item.href !== '/' && pathname?.match(new RegExp(`^${item.href}(/\n)*`))
      )
        ? true
        : false
    )
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorMenuEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorMenuEl(null);
  };

  const handleLogout = async () => {
    await apiDeleteData('logout');
    logout();
    handleMenuClose();
  };
  const handleClickProfile = () => {
    router.push('/profile');
    handleMenuClose();
  };

  const handleDrawerClose = () => {
    setIsClosing(true);
    setOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setOpen(!open);
    }
  };

  const toggleNavSubDesk = (name: string, items: IMenuItem[] = []) => {
    setNavSubDesk((prev) => ({
      open: prev.name === name ? !prev.open : true,
      name,
      items,
    }));
  };

  const closeNavSubDesk = () => {
    setNavSubDesk(() => ({
      open: false,
      name: '',
      items: [],
    }));
  };

  useEffect(() => {
    if (!mdDown) {
      changeSidebarWidth(open ? 56 : 286);
    } else {
      changeSidebarWidth(286);
    }
  }, [open, mdDown]);

  useEffect(() => {
    if (echo && userProfile) {
      echo.private(`notifications.${userProfile.id}`).listen('NewNotification', () => {
        refetch();
        const sound = new Audio('/sounds/notificationSound.wav');
        sound.play();
      });
    }
  }, [echo, userProfile]);

  useEffect(() => closeNavSubDesk(), [collapsed]);

  const drawer = (
    <Stack
      gap='2rem'
      className='customScroll customMenuScroll'
      sx={{
        flexDirection: 'column',
        direction: 'rtl',
        overflow: 'auto',
      }}
    >
      <List
        component='div'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          direction: 'ltr',
          paddingLeft: !collapsed ? '.5rem' : 'unset',
          gap: '1.5rem',
        }}
      >
        {visibleMenuItems.map((item, index) => {
          if (item.type === 'sub-menu') {
            return (
              <motion.div
                custom={index}
                key={item.id}
                initial='hidden'
                animate='visible'
                variants={itemVariants}
              >
                <NavSubMenu
                  title={item.title}
                  icon={item.icon}
                  childItems={item.childItems}
                  toggleNavSubDesk={toggleNavSubDesk}
                  menuWidth={sidebarWidth}
                  collapsed={collapsed}
                  ref={drawerRef}
                />
              </motion.div>
            );
          }
          if (item.type === 'group' && collapsed) {
            return (
              <motion.div
                key={item.id}
                custom={index}
                initial='hidden'
                animate='visible'
                variants={itemVariants}
              >
                <NavSubMenu
                  title={item.title}
                  icon={item.icon}
                  childItems={item.childItems}
                  toggleNavSubDesk={toggleNavSubDesk}
                  menuWidth={sidebarWidth}
                  collapsed={collapsed}
                  ref={drawerRef}
                />
              </motion.div>
            );
          }
          if (item.type === 'group') {
            return (
              <motion.div
                key={item.id}
                custom={index}
                initial='hidden'
                animate='visible'
                variants={itemVariants}
              >
                <NavGroup
                  closeNavSubDesk={closeNavSubDesk}
                  title={item.title}
                  icon={item.icon}
                  childItems={item.childItems}
                  collapsed={collapsed}
                  index={index}
                  expanded={expanded}
                  setExpanded={setExpanded}
                />
              </motion.div>
            );
          }
          return (
            <motion.div
              key={item.id}
              custom={index}
              initial='hidden'
              animate='visible'
              variants={itemVariants}
            >
              <NavLink
                closeNavSubDesk={closeNavSubDesk}
                title={item.title}
                icon={item.icon}
                href={item.href}
                collapsed={collapsed}
                isMain
              />
            </motion.div>
          );
        })}
      </List>
    </Stack>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position='fixed'
        elevation={0}
        sx={{
          width: {
            md: `calc(100% - ${sidebarWidth}px)`,
          },
          backgroundColor: '#fff',
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
          ml: { md: `${sidebarWidth}px` },
        }}
      >
        <Toolbar
          sx={{
            minHeight: 'unset',
            '&.MuiToolbar-root': {
              justifyContent: 'space-between',
              minHeight: 'unset',
              height: '3rem',
            },
          }}
        >
          <IconButton
            color='primary'
            aria-label='open drawer'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{ mr: 2, minHeight: '48px', display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          {!mdDown && <CustomBreadcrumbs />}
          {profilePageName && <Typography color='primary'>{profilePageName}</Typography>}
          <Box sx={{ display: { md: 'flex' } }}>
            {(!!entityBlockIdForGuides || !!progressableTypeForGuides) && (
              <Tooltip title='Guides' placement='bottom'>
                <IconButton
                  size='large'
                  aria-label='show notifications'
                  color='primary'
                  onClick={() => {
                    handleActions(true);
                  }}
                >
                  <HelpOutlineOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title='Edits' placement='bottom'>
              <IconButton
                size='large'
                aria-label='show notifications'
                color='primary'
                disabled={!entityBlockId && !progressableType}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  setAnchorEditsEl(event.currentTarget);
                }}
              >
                <Badge badgeContent={countEdits} invisible={!countEdits} color='error'>
                  <EditNoteIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title='Notification' placement='bottom'>
              <IconButton
                size='large'
                aria-label='show notifications'
                color='primary'
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  setAnchorNotificationsEl(event.currentTarget);
                }}
              >
                <Badge
                  badgeContent={notifications?.count}
                  invisible={!notifications?.count}
                  color='error'
                >
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            <AppGuides visible={actionsData.visible} handleActions={handleActions} />
            <AppEdits
              open={openEdits}
              anchorEl={anchorEditsEl}
              handleClose={() => {
                setAnchorEditsEl(null);
              }}
            />
            <AppNotifications
              open={openNotifications}
              notifications={notifications?.data}
              anchorEl={anchorNotificationsEl}
              fetchNextNotification={fetchNextNotification}
              handleClose={() => setAnchorNotificationsEl(null)}
            />
            <IconButton size='large' color='primary' onClick={handleMenuOpen}>
              <Avatar
                alt={userProfile?.name}
                src={userProfile?.image}
                sx={{ width: 30, height: 30 }}
              />
            </IconButton>
            <Menu id='basic-menu' anchorEl={anchorMenuEl} open={openMenu} onClose={handleMenuClose}>
              <Typography
                color='primary'
                textAlign='center'
                fontWeight={500}
                sx={{ paddingBottom: '.5rem' }}
              >
                {userProfile?.name}
              </Typography>
              <Divider />
              <MenuItem onClick={handleClickProfile}>
                <ListItemIcon>
                  <AccountBoxIcon />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component='nav'
        ref={drawerRef}
        sx={{
          width: { md: sidebarWidth },
          flexShrink: { md: 0 },
          height: '100dvh',
        }}
        aria-label='mailbox folders'
      >
        <Drawer
          variant='temporary'
          open={open}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
            disableScrollLock: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: sidebarWidth,
              overflow: 'hidden',
              padding: '1rem .5rem 2rem .5rem',
              backgroundColor: (theme: any) => theme.palette.menu.main,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant='permanent'
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              justifyContent: 'space-between',
              width: sidebarWidth,
              overflow: 'hidden',
              padding: '1rem .5rem 2rem .5rem',
              backgroundColor: (theme: any) => theme.palette.menu.main,
            },
          }}
          ModalProps={{ disableScrollLock: true }}
        >
          {drawer}
          <Button
            sx={{
              color: '#fff',
              minWidth: 'unset',
            }}
            onClick={handleDrawerToggle}
          >
            {!collapsed ? <KeyboardDoubleArrowLeftIcon /> : <KeyboardDoubleArrowRightIcon />}
            {!collapsed ? 'Collapse Sidebar' : ''}
          </Button>
        </Drawer>
      </Box>
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          overflowX: 'hidden',
          width: {
            md: `calc(100% - ${sidebarWidth}px)`,
            xs: `100%`,
          },
        }}
      >
        <Toolbar
          sx={{
            minHeight: 'unset',
            '&.MuiToolbar-root': {
              minHeight: 'unset',
              height: '3rem',
            },
          }}
        />
        <Stack flexDirection='row' justifyContent='center'>
          <NavSubDesktop
            open={navSubDesk.open}
            items={navSubDesk.items}
            closeNavSubDesk={closeNavSubDesk}
            collapsed={false}
          />
          <Stack
            sx={{
              width: {
                md: navSubDesk.open ? 'calc(100% - 12rem)' : '100%',
                xs: '100%',
              },
            }}
          >
            {children}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
