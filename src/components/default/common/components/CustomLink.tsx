import { Link } from '@mui/material';

export default function CustomLink({
  label,
  link,
  sx,
  target = '_blank',
}: {
  link: string;
  target?: '_blank' | '_self';
  label?: string;
  sx?: any;
}) {
  return (
    <Link
      href={link}
      color='primary'
      sx={{
        fontSize: '1rem',
        ...sx,
      }}
      underline='hover'
      target={target}
    >
      {label ? label : link?.length > 35 ? link.slice(0, 35) + '..' : link}
    </Link>
  );
}
