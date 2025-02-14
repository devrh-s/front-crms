import { useMemo } from 'react';
import { Breadcrumbs, Link as BreadcrumbLink } from '@mui/material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
export default function CustomBreadcrumbs() {
  const pathname = usePathname();
  const paths = useMemo(() => {
    const pathsArr = pathname.split('/');
    return pathsArr
      .map((path, ind) => {
        if (!ind) return { name: 'Dashboard', href: '/' };
        // if (!Number.isNaN(+path)) return;
        return {
          name: path.replace(/[^A-Za-z0-9]/g, ' '),
          href: pathsArr.slice(0, ind + 1).join('/'),
        };
      })
      .filter((el) => el?.name);
  }, [pathname]);

  return (
    <Breadcrumbs aria-label='breadcrumb'>
      {paths.map((path, ind) => (
        <BreadcrumbLink
          key={ind}
          component={Link}
          underline='hover'
          color={paths.length - 1 === ind ? 'primary' : 'inherit'}
          href={path?.href ?? '/'}
          sx={{
            textTransform: 'capitalize',
          }}
        >
          {path?.name}
        </BreadcrumbLink>
      ))}
    </Breadcrumbs>
  );
}
