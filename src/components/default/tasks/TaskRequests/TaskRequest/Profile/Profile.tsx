'use client';

import useActions from '@/hooks/useActions';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import TaskRequstsActions from '../../TaskRequestsActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ConstructionIcon from '@mui/icons-material/Construction';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import TasksActions from '../../../Tasks/TasksActions';
import { useState } from 'react';
import { Button, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { setTaskId } from '@/redux/slices/taskIdSlice';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import DescriptionIcon from '@mui/icons-material/Description';
import EngineeringSharpIcon from '@mui/icons-material/EngineeringSharp';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import OfflinePinOutlinedIcon from '@mui/icons-material/OfflinePinOutlined';
import TaskIcon from '@mui/icons-material/Task';

interface IGuideProfileProps {
  id: number;
  index: string;
  value: string;
  taskRequest: ITaskRequest | null;
  commonData: ICommonData;
}

export default function Profile({ id, index, value, taskRequest, commonData }: IGuideProfileProps) {
  const { actionsData, handleActions } = useActions(id);
  const [taskRequestData, setTaskRequestData] = useState<ITaskRequest | null>(null);
  const {
    actionsData: actionsDataTask,
    deleteModal: deleteModalTask,
    handleActions: handleActionsTask,
    handleDeleteModal: handleDeleteModalTask,
    handleClose: handleCloseTask,
  } = useActions();
  const dispatch = useDispatch();

  const profile = {
    name: taskRequest?.title ? taskRequest?.title : 'No Name',
    id: taskRequest?.id,
    topContent: {
      title: 'Description',
      icon: <DescriptionIcon />,
      value: taskRequest?.description,
      type: 'text',
    },
    bottomContent: {
      user: {
        title: 'Created By',
        value: taskRequest?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: taskRequest?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'State',
        icon: <OfflinePinOutlinedIcon />,
        value: taskRequest?.task ? (
          taskRequest?.task.is_completed === 0 ? (
            <ConstructionIcon color='info' />
          ) : (
            <CheckCircleOutlineIcon color='success' />
          )
        ) : (
          <RemoveCircleOutlineIcon color='warning' />
        ),
        type: 'text',
      },
      {
        title: 'Task Template',
        icon: <NewspaperIcon />,
        value: taskRequest?.task_template?.name,
        href: `task-templates/${taskRequest?.task_template?.id}`,
        type: 'nameLink',
      },
      {
        title: 'Task',
        icon: <TaskIcon />,
        value: taskRequest?.task?.title ? (
          <Typography
            color={'primary'}
            sx={{
              cursor: 'pointer',
            }}
            onClick={() => {
              window.open('/tasks', '_blank');
              dispatch(setTaskId(taskRequest.task?.id));
            }}
          >
            {taskRequest.task.title}
          </Typography>
        ) : (
          <Button
            sx={{
              minWidth: 'max-content',
            }}
            size='small'
            variant='contained'
            onClick={() => {
              setTaskRequestData(taskRequest);
              handleActionsTask(true);
            }}
          >
            Work on task
          </Button>
        ),
        type: 'text',
      },
      {
        title: 'Priority',
        icon: <LowPriorityIcon />,
        value: taskRequest?.priority?.name,
        type: 'text',
      },
      {
        title: 'Professions',
        icon: <EngineeringSharpIcon />,
        value: taskRequest?.professions,
        type: 'moreChips',
      },
      {
        title: 'Assignees',
        icon: <GroupOutlinedIcon />,
        value: taskRequest?.assignees,
        type: 'moreChips',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <TaskRequstsActions
          id={id}
          visible={actionsData.visible}
          isProfile
          commonData={commonData}
          handleActions={handleActions}
        />
        <TasksActions
          id={actionsDataTask.id}
          visible={actionsDataTask.visible}
          isProfile
          commonData={commonData}
          handleActions={handleActionsTask}
          taskRequest={taskRequestData}
        />
      </>
    )
  );
}
