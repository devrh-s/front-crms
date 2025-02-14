import { apiGetData } from '@/lib/fetch';
import { List, ListItem, ListItemText } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

interface IRolesAndPermissionProps {
  position_id?: number;
  profession_id?: number;
}

export default function TooltipContent({ position_id, profession_id }: IRolesAndPermissionProps) {
  const { data, isFetching } = useQuery({
    queryKey: ['rolesAndPermission', position_id, profession_id],
    queryFn: async () => {
      const response =
        (await apiGetData(
          `permissions?position_id=${position_id}&profession_id=${profession_id}`
        )) ?? [];

      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: !!position_id && !!profession_id,
  });

  if (!position_id || !profession_id) {
    return <p>Add position and profession fields to view roles</p>;
  }

  if (isFetching) {
    return <p>Loading...</p>;
  }

  return (
    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
      {data && data.length > 0
        ? data.map((item: IRolesAndPermission) => (
            <ListItem key={item.id}>
              <ListItemText primary={item.display_name} />
            </ListItem>
          ))
        : 'No available roles'}
    </List>
  );
}
