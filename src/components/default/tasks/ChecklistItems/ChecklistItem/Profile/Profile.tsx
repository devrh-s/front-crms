'use client';

import MoreChips from '@/components/default/common/components/MoreChips';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import GuideInfo from '../../../components/GuideInfo';
import ChecklistItemsActions from '../../ChecklistItemsActions';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DrawIcon from '@mui/icons-material/Draw';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PlaceIcon from '@mui/icons-material/Place';

interface IChecklistItemProfileProps {
  id: number;
  index: string;
  value: string;
  checklistItem: IChecklistItemType | null;
  commonData: ICommonData;
}

export default function GuideProfile({
  id,
  index,
  value,
  checklistItem,
  commonData,
}: IChecklistItemProfileProps) {
  const { actionsData, handleActions } = useActions(id);
  const profile = {
    name: checklistItem?.name,
    id: checklistItem?.id,
    bottomContent: {
      user: {
        title: 'Created By',
        value: checklistItem?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: checklistItem?.created_at,
          type: 'date',
        },
        {
          title: 'Updated At',
          value: checklistItem?.updated_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Guides',
        icon: <AssignmentIcon />,
        value: (
          <MoreChips
            data={checklistItem?.guides ? checklistItem.guides : []}
            propName='name'
            handleSetModal={(data: any) => window.open(`/guides/${data.id}`)}
          />
        ),
        type: 'component',
      },
      {
        title: 'Is Draft',
        icon: <DrawIcon />,
        value: checklistItem?.is_draft === 1 ? 'Yes' : 'No',
        type: 'text',
      },
      {
        title: 'Placement',
        icon: <PlaceIcon />,
        value: checklistItem?.placement?.name,
        href: `/placements/${checklistItem?.placement?.id}`,
        type: 'nameLink',
      },
      {
        title: 'Tool',
        icon: <BuildCircleIcon />,
        value: checklistItem?.tool?.name,
        href: checklistItem?.tool?.link,
        type: 'nameLink',
      },
      {
        title: 'Object',
        icon: <DataObjectIcon />,
        value: checklistItem?.object?.name,
        href: `/objects/${checklistItem?.object?.id}`,
        type: 'nameLink',
      },
      {
        title: 'Action',
        icon: <PendingActionsIcon />,
        value: checklistItem?.action?.name,
        href: `/actions/${checklistItem?.action?.id}`,
        type: 'nameLink',
      },
    ],
    // accordions: checklistItem?.guides.map((el: any) => {
    //   return {
    //     component: <GuideInfo guide={el} />,
    //     title: `Guide: ${el.name} (ID:${el.id})`,
    //   };
    // }),
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <ChecklistItemsActions
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
