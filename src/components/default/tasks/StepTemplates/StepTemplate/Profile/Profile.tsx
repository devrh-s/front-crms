'use client';

import MoreChips from '@/components/default/common/components/MoreChips';
import Modal from '@/components/default/common/modals/Modal/Modal';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import { useState } from 'react';
import GuidesInfo from '../../../components/GuidesInfo';
import StepTemplatesActions from '../../StepTemplatesActions';
import { IGuidesInfo } from '../../types';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DescriptionIcon from '@mui/icons-material/Description';
import DrawIcon from '@mui/icons-material/Draw';
import ListIcon from '@mui/icons-material/List';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

interface IChecklistItemProfileProps {
  id: number;
  index: string;
  value: string;
  stepTempate: IStepTemplate | null;
  commonData: ICommonData;
}

export default function StepTemplateProfile({
  id,
  index,
  value,
  stepTempate,
  commonData,
}: IChecklistItemProfileProps) {
  const { actionsData, handleActions } = useActions(id);
  const [infoModal, setInfoModal] = useState<IGuidesInfo>({ name: '', guides: [] });
  const handleSetModal = (data: IGuidesInfo) => {
    setInfoModal({ guides: data.guides, name: data.name });
  };
  const checklistItemsAccordions =
    stepTempate?.checklist_items.map((el: any) => ({
      component: <GuidesInfo guides={el.guides} />,
      title: `Checklist Item: ${el.name}`,
    })) ?? [];

  const profile = {
    name: stepTempate?.name,
    id: stepTempate?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: stepTempate?.description,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: stepTempate?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: stepTempate?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Hours Planned',
        icon: <AvTimerIcon />,
        value: stepTempate?.hours_planned,
        type: 'text',
      },
      {
        title: 'Is Draft',
        icon: <DrawIcon />,
        value: stepTempate?.is_draft === 1 ? 'Yes' : 'No',
        type: 'text',
      },
      {
        title: 'Tool',
        icon: <BuildCircleIcon />,
        value: stepTempate?.tool?.name,
        href: `/tools/${stepTempate?.tool?.id}`,
        type: 'nameLink',
      },
      {
        title: 'Object',
        icon: <DataObjectIcon />,
        value: stepTempate?.object?.name,
        href: `/objects/${stepTempate?.object?.id}`,
        type: 'nameLink',
      },
      {
        title: 'Action',
        icon: <PendingActionsIcon />,
        value: stepTempate?.action?.name,
        href: `/actions/${stepTempate?.action?.id}`,
        type: 'nameLink',
      },
      {
        title: 'Checklist Items',
        icon: <ListIcon />,
        value: (
          <MoreChips
            data={
              stepTempate?.checklist_items
                ? stepTempate?.checklist_items.map((el: any) => ({
                    ...el,
                    name: el.name,
                  }))
                : []
            }
            propName='name'
            handleSetModal={(data: any) => window.open(`/checklist-items/${data.id}`)}
          />
        ),
        type: 'component',
      },
    ],
    // accordions: [
    //   ...checklistItemsAccordions,
    // ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <StepTemplatesActions
          id={id}
          visible={actionsData.visible}
          isProfile
          commonData={commonData}
          handleActions={handleActions}
          handleSetModal={handleSetModal}
        />
        <Modal
          title={`Checklict Item: ${infoModal.name}`}
          open={!!infoModal.name}
          handleClose={() => setInfoModal({ name: '', guides: [] })}
        >
          <GuidesInfo guides={infoModal.guides} />
        </Modal>
      </>
    )
  );
}
