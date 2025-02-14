import { Avatar, Chip } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

interface ICreatedByProps {
  data?: IUser;
  sx?: {
    [key: string]: string | number;
  };
}

export default function UserChip({ data, sx }: ICreatedByProps) {
  if (!data) return;
  return (
    <Link href={data?.link || `/users/${data?.id}`} target='_blank'>
      <Chip
        key={data?.id}
        label={data?.name}
        avatar={
          data?.image ? (
            <Avatar alt={data?.name}>
              <Image src={data?.image} alt={data?.name} layout='fill' loading='lazy' />
            </Avatar>
          ) : (
            <Avatar alt={data?.name} />
          )
        }
        sx={{
          background: 'white',
          height: '1.5rem',
          fontSize: '.9rem',
          '&:hover': {
            color: (theme) => theme.palette.primary.main,
          },
          ...sx,
        }}
      />
    </Link>
  );
}
