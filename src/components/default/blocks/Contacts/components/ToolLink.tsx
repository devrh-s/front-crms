import { Link, Typography } from '@mui/material';

export default function ToolLink({
  toolName,
  baseUrl,
  path,
}: {
  toolName: string;
  baseUrl: string | null;
  path: string;
}) {
  const getFullLink = () => {
    if (!path) return '';

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const fixedPath = path.startsWith('/') ? path.slice(1) : path;
    const fixedBaseUrl = baseUrl ? (baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`) : '';

    switch (toolName?.toLowerCase()) {
      case 'email':
        return `mailto:${fixedPath}`;
      case 'phone':
        return `tel:${fixedPath}`;
      case 'telegram':
        return `${fixedBaseUrl}${fixedPath.replace('@', '')}`;
      default:
        return fixedBaseUrl ? `${fixedBaseUrl}${fixedPath}` : '';
    }
  };

  const link = getFullLink();

  return link ? (
    <Link
      href={link}
      color='primary'
      sx={{
        fontSize: '1rem',
      }}
      underline='hover'
      target='_blank'
    >
      {path}
    </Link>
  ) : (
    <Typography sx={{ fontSize: '1rem' }}>{path}</Typography>
  );
}
