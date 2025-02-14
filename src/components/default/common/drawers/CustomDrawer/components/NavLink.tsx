import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Link as MLink, Tooltip } from '@mui/material';
import { IMenuItem } from '../types';

interface INavLink extends IMenuItem {
  isMain?: boolean;
  black?: boolean;
  closeNavSubDesk?: () => void;
  collapsed?: boolean;
}
interface INavCustomLink {
  href?: string;
  closeNavSubDesk?: () => void;
  black?: boolean;
  isActive: boolean;
  children: any;
}

const CustomLink = ({ href, closeNavSubDesk, isActive, children, black }: INavCustomLink) => (
  <MLink
    component={Link}
    href={href ?? ''}
    underline='none'
    onClick={closeNavSubDesk}
    sx={{
      display: 'flex',
      alignItems: 'center',
      fontSize: '1rem',
      gap: '.5rem',
      color: (theme: any) => {
        const normalColor = black
          ? theme.palette.menuLight.contrastText
          : theme.palette.menu.contrastText;
        const accentColor = theme.palette.secondary.main;
        return isActive ? accentColor : normalColor;
      },
      '&:hover': {
        color: (theme) => theme.palette.secondary.main,
      },
    }}
  >
    {children}
  </MLink>
);

export default function NavLink({
  title,
  href,
  icon,
  closeNavSubDesk,
  collapsed,
  black,
}: INavLink) {
  const pathname = usePathname();
  const isActive = href === '/' ? href === pathname : pathname?.match(new RegExp(`^${href}(/\n)*`));
  return !collapsed ? (
    <CustomLink href={href} closeNavSubDesk={closeNavSubDesk} isActive={!!isActive} black={black}>
      {icon}&nbsp;{title}
    </CustomLink>
  ) : (
    <Tooltip title={title} placement='right-end'>
      <div>
        <CustomLink
          href={href}
          closeNavSubDesk={closeNavSubDesk}
          isActive={!!isActive}
          black={black}
        >
          {icon}
        </CustomLink>
      </div>
    </Tooltip>
  );
}
