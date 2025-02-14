'use client';

import useActions from '@/hooks/useActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import { IToolType } from '../../types';
import ToolTypesActions from '../../ToolTypeActions';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';

interface IAccountProfileProps {
  id: number;
  index: string;
  value: string;
  toolType: IToolType | null;
  commonData: ICommonData;
}

export default function LevelProfile({
  id,
  index,
  value,
  toolType,
  commonData,
}: IAccountProfileProps) {
  const { actionsData, handleActions } = useActions(id);

  const profile = {
    name: toolType?.name.split('_').join(' '),
    id: toolType?.id,
    fields: [
      {
        title: 'Tools',
        icon: <BuildCircleIcon />,
        value: toolType?.tools,
        type: 'moreChips',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <ToolTypesActions
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
