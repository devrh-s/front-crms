'use client';
import { useMemo } from 'react';
import UserActions from '../../UserActions';
import useActions from '@/hooks/useActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import { getPagePermissions } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import DoneOutlineOutlinedIcon from '@mui/icons-material/DoneOutlineOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import LocalAtmOutlinedIcon from '@mui/icons-material/LocalAtmOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import WebStoriesOutlinedIcon from '@mui/icons-material/WebStoriesOutlined';

interface ProfileProps {
  id: number;
  index: string;
  value: string;
  user: IUser | null;
  commonData: ICommonData;
}

export default function Profile({ id, index, value, user, commonData }: ProfileProps) {
  const { permissions } = useAuthStore();
  const { actionsData, handleActions } = useActions();

  const pagePermissions = useMemo(
    () => getPagePermissions('Talents', 'Users', permissions),
    [permissions]
  );

  const profile = {
    name: user?.name,
    image: user?.image,
    id: user?.id,
    fields: [
      {
        title: 'Full Name',
        icon: <PersonOutlineIcon />,
        value: user?.name,
        type: 'text',
      },
      {
        title: 'Email',
        icon: <MailOutlineIcon />,
        value: user?.email,
        type: 'text',
      },
      {
        title: 'Availability',
        icon: <EventAvailableOutlinedIcon />,
        value: user?.is_active,
        type: 'availability',
      },
      {
        title: 'Task Assigned',
        icon: <WebStoriesOutlinedIcon />,
        value: user?.task_assigned,
        type: 'text',
      },
      {
        title: 'Task Done',
        icon: <DoneOutlineOutlinedIcon />,
        value: user?.task_done,
        type: 'text',
      },
      {
        title: 'Hourly Cost',
        icon: <PriceChangeOutlinedIcon />,
        value: user?.hourly_cost,
        type: 'text',
      },
      {
        title: 'Currency',
        icon: <LocalAtmOutlinedIcon />,
        value: user?.currency?.name,
        type: 'text',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />
        <UserActions
          id={id}
          isProfile
          pagePermissions={pagePermissions}
          visible={actionsData.visible}
          commonData={commonData}
          handleActions={handleActions}
        />
      </>
    )
  );
}
