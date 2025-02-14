'use client';

import useActions from '@/hooks/useActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import DepartmentActions from '../../DepartmentActions';
import DescriptionIcon from '@mui/icons-material/Description';
import EngineeringIcon from '@mui/icons-material/Engineering';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import LinkIcon from '@mui/icons-material/Link';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import TranslateIcon from '@mui/icons-material/Translate';

interface IAccountProfileProps {
  id: number;
  index: string;
  value: string;
  department: IDepartment | null;
  commonData: ICommonData;
}

export default function CityProfile({
  id,
  index,
  value,
  department,
  commonData,
}: IAccountProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: department?.name,
    id: department?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: department?.description,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: department?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: department?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: department?.status,
        type: 'status',
      },
      {
        title: 'Professions',
        icon: <EngineeringIcon />,
        value: department?.professions,
        type: 'moreChips',
      },
      {
        title: 'Translation',
        icon: <TranslateIcon />,
        value: department?.translation.name,
        type: 'text',
      },
      {
        title: 'Group',
        icon: <GroupWorkOutlinedIcon />,
        value: department?.library?.name,
        type: 'text',
      },
      {
        title: 'Priority',
        icon: <LowPriorityIcon />,
        value: department?.priority.name,
        type: 'text',
      },
      {
        title: 'Links',
        icon: <LinkIcon />,
        value: department?.links,
        type: 'moreChips',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <DepartmentActions
          id={id}
          visible={actionsData.visible}
          isProfile
          commonData={commonData}
          handleActions={handleActions}
        />
      </>
    )
  );
}
