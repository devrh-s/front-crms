import { Link as MLink } from '@mui/material';
import { addQueryFilters } from '@/redux/slices/queryFilters';
import { useDispatch } from 'react-redux';
import Link from 'next/link';

export default function FilterLink({
  label,
  link,
  filterPage,
  filterName,
  filterValue,
}: {
  link: string;
  label?: string;
  filterName: string;
  filterPage: string;
  filterValue: any;
}) {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(
      addQueryFilters({
        page: filterPage,
        name: filterName,
        value: filterValue,
      })
    );
  };
  return (
    <MLink
      href={link}
      component={Link}
      color='primary'
      sx={{
        fontSize: '1rem',
      }}
      underline='hover'
      onClick={handleClick}
    >
      {label}
    </MLink>
  );
}
