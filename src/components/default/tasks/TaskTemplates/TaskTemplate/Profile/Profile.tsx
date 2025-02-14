'use client';

import MoreChips from '@/components/default/common/components/MoreChips';
import Modal from '@/components/default/common/modals/Modal/Modal';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import { useState } from 'react';
import StepTempalteInfo from '../../StepTempalteInfo';
import StepTemplatesActions from '../../TaskTemplatesActions';
import { IGuidesInfo } from '../../types';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DescriptionIcon from '@mui/icons-material/Description';
import DrawIcon from '@mui/icons-material/Draw';
import EngineeringSharpIcon from '@mui/icons-material/EngineeringSharp';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import NewspaperOutlinedIcon from '@mui/icons-material/NewspaperOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import TaskIcon from '@mui/icons-material/Task';

interface IChecklistItemProfileProps {
  id: number;
  index: string;
  value: string;
  taskTemplate: ITaskTemplate | null;
  commonData: ICommonData;
}

export default function TaskTemplateProfile({
  id,
  index,
  value,
  taskTemplate,
  commonData,
}: IChecklistItemProfileProps) {
  const { actionsData, handleActions } = useActions(id);
  const [infoModal, handleSetInfoModal] = useState<IGuidesInfo>({
    data: { name: '' },
  } as IGuidesInfo);
  // const setModal = (data: any) => {
  //   handleSetInfoModal({ data: data });
  // };
  // const stepTemplateAccordions = taskTemplate
  //   ? taskTemplate.step_templates.map((el: any) => {
  //       return {
  //         component: <StepTempalteInfo data={el} />,
  //         title: `Step Template: ${el.name}`,
  //       };
  //     })
  //   : [];

  const profile = {
    name: taskTemplate?.name,
    id: taskTemplate?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: taskTemplate?.description,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: taskTemplate?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: taskTemplate?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Is Draft',
        icon: <DrawIcon />,
        value: taskTemplate?.is_draft === 1 ? 'Yes' : 'No',
        type: 'text',
      },
      {
        title: 'Professions',
        icon: <EngineeringSharpIcon />,
        value: taskTemplate?.professions?.map((el: any) => ({
          ...el,
          name: el?.name,
        })),
        type: 'moreChips',
      },
      {
        title: 'Step Templates',
        icon: <FormatListNumberedIcon />,
        value: (
          <MoreChips
            data={
              taskTemplate
                ? taskTemplate.step_templates.map((el: any) => ({
                    ...el,
                    name: el?.name,
                  }))
                : []
            }
            propName='name'
            handleSetModal={(data: any) => window.open(`/step-templates/${data?.id}`)}
          />
        ),
        type: 'component',
      },
      {
        title: 'Object',
        icon: <DataObjectIcon />,
        value: taskTemplate?.object?.name,
        href: `/objects/${taskTemplate?.object?.id}`,
        type: 'nameLink',
      },
      {
        title: 'Action',
        icon: <PendingActionsIcon />,
        value: taskTemplate?.action?.name,
        href: `/actions/${taskTemplate?.action?.id}`,
        type: 'nameLink',
      },
      {
        title: 'Expected Hours',
        icon: <AccessTimeIcon />,
        value: taskTemplate?.expected_hours,
        type: 'text',
      },
      {
        title: 'Frequency',
        icon: <CalendarTodayIcon />,
        value: taskTemplate?.frequency?.name,
        type: 'text',
      },
      {
        title: 'Cost',
        icon: <AttachMoneyIcon />,
        value: taskTemplate?.cost,
        type: 'text',
      },
      {
        title: 'Parent Tasks',
        icon: <NewspaperOutlinedIcon />,
        value: (
          <MoreChips
            data={taskTemplate?.parent_task_templates ? taskTemplate?.parent_task_templates : []}
            propName='name'
            handleSetModal={(data: any) => window.open(`/task-templates/${data.id}`)}
          />
        ),
        type: 'component',
      },
      {
        title: 'Task quantity',
        icon: <TaskIcon />,
        value: taskTemplate?.task_quantity,
        type: 'text',
      },
    ],
    // accordions: [
    //   ...stepTemplateAccordions,
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
        />
        <Modal
          title={`Step Template: ${infoModal?.data?.name}`}
          open={!!infoModal?.data?.name}
          handleClose={() => handleSetInfoModal({ data: { name: '' } } as IGuidesInfo)}
        >
          <StepTempalteInfo data={infoModal?.data as any} />
        </Modal>
      </>
    )
  );
}
