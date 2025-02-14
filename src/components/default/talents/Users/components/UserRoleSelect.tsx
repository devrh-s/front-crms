import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import { apiUpdateData } from '@/lib/fetch';
import useNotification from '@/hooks/useNotification';

interface IUserRoleSelectProps {
  userId: number | string;
  commonData: ICommonData;
  defaultRole: number | string;
}

export default function UserRoleSelect({ userId, defaultRole, commonData }: IUserRoleSelectProps) {
  const showNotification = useNotification();
  const [role, setRole] = useState<number | string>('');
  const roles = commonData.roles ?? [];
  const { mutate } = useMutation({
    mutationFn: (roleId: number | string) =>
      apiUpdateData(`role-permissions/${roleId}/users`, { users: [userId] }, true),
    onSuccess: (result) => {
      if (result.success) {
        showNotification('Successfully updated user role', 'success');
      } else if (result?.error) {
        showNotification('Something went wrong', 'error');
      }
    },
  });

  useEffect(() => {
    setRole(defaultRole);
  }, [defaultRole]);

  return (
    <CustomSingleSelect
      options={roles ?? []}
      field={{
        value: role,
        onChange: function (id: number | string) {
          setRole(id);
          if (id) {
            mutate(id);
          }
        },
      }}
      style={{ width: '100%' }}
    />
  );
}
