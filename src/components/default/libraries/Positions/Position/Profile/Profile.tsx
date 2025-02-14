'use client';
import useActions from '@/hooks/useActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import PositionActions from '../../PositionActions';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import TranslateIcon from '@mui/icons-material/Translate';

interface IPositionProfileProps {
  id: number;
  index: string;
  value: string;
  position: IPosition | null;
  commonData: ICommonData;
}

export default function PositionProfile({
  id,
  index,
  value,
  position,
  commonData,
}: IPositionProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: position?.name,
    id: position?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: position?.description,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: position?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: position?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: position?.status,
        type: 'status',
      },
      {
        title: 'Translation',
        icon: <TranslateIcon />,
        value: position?.translation.name,
        type: 'text',
      },
      {
        title: 'Group',
        icon: <GroupWorkOutlinedIcon />,
        value: position?.library.name,
        type: 'text',
      },
      {
        title: 'Priority',
        icon: <LowPriorityIcon />,
        value: position?.priority.name,
        type: 'text',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <PositionActions
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
