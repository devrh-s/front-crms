import { Avatar, Link as MLink, PaletteColor, Theme } from '@mui/material';
import Link from 'next/link';

type StyleType = ((theme: Theme) => string | PaletteColor) | string | number;

export default function NameLink({
  href,
  name,
  image,
  sx = {},
  target = '_blank',
}: {
  href: string;
  name: any;
  image?: string;
  target?: '_blank' | '_self';
  sx?: {
    [key: string]: StyleType;
  };
}) {
  const isAbsolute = /(^http)|(^\/)/.test(href);
  return (
    <div>
      <MLink
        component={Link}
        href={isAbsolute ? href : `/${href}`}
        underline='none'
        target={target}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '0.5rem',
          textTransform: 'capitalize',
          paddingLeft: '0.5rem',
          color: (theme: Theme) => theme.palette.primary.main,
          '&:hover': (theme: Theme) => theme.palette.primary.main,
          '&:visited': (theme: Theme) => theme.palette.primary.main,
          ...sx,
        }}
      >
        {image && <Avatar src={image} sx={{ width: '1.5rem', height: '1.5rem' }} />}
        {name}
      </MLink>
    </div>
  );
}
