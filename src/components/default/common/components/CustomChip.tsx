import { Avatar, Chip, Tooltip } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

type BgColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

interface ICustomChipProps {
  data: {
    id?: number | string;
    title?: string;
    name?: string;
    image?: string | null;
    link?: string;
    tooltip?: string | null;
    bgColor?: BgColor;
  };
  handleClick?: () => void;
  sx?: any;
  label?: string;
  handleSetModal?: any;
}

function getShortLabel(label?: any) {
  if (!label) return '';
  if (typeof label === 'number') return label;
  if (typeof label === 'object') return label?.name;
  const shortLabel = label?.slice(0, 20);
  return shortLabel.length < label.length ? `${shortLabel}...` : label;
}

export default function CustomChip({
  data,
  label,
  handleSetModal,
  handleClick,
  sx,
}: ICustomChipProps) {
  if (!data) return;
  if (data?.image) {
    return (
      <Tooltip title={data?.tooltip ?? data?.title ?? data?.name} placement='bottom-end'>
        <Chip
          label={getShortLabel(label ?? data?.title ?? data?.name)}
          sx={{ ...sx, color: 'inherit' }}
          avatar={
            data?.image ? (
              <Avatar alt={data?.name}>
                <Image src={data?.image} alt={data?.name ?? ''} layout='fill' loading='lazy' />
              </Avatar>
            ) : (
              <Avatar alt={data?.name} />
            )
          }
          onClick={handleClick}
        />
      </Tooltip>
    );
  }
  if (data?.link) {
    return (
      <Tooltip title={data?.tooltip ?? data?.title ?? data?.name} placement='bottom-end'>
        <Chip
          label={getShortLabel(label ?? data?.title ?? data?.name)}
          component={Link}
          color={data?.bgColor ?? 'primary'}
          href={data.link}
          sx={{
            ...sx,
            cursor: 'pointer',
          }}
        />
      </Tooltip>
    );
  }
  if (handleSetModal) {
    return (
      <Tooltip title={data?.tooltip ?? data?.title ?? data?.name} placement='bottom-end'>
        <Chip
          label={getShortLabel(label ?? data?.name)}
          color='primary'
          onClick={() => handleSetModal(data)}
        />
      </Tooltip>
    );
  }
  return (
    <Tooltip title={data?.tooltip ?? data?.title ?? data?.name} placement='bottom-end'>
      <Chip
        color={data?.bgColor ?? 'default'}
        label={getShortLabel(label ?? data?.name)}
        onClick={handleClick}
        sx={{ ...sx }}
      />
    </Tooltip>
  );
}
