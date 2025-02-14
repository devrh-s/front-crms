'use client';

import MoreChips from '@/components/default/common/components/MoreChips';
import EntityProfile from '@/components/default/common/pages/EntityProfile/EntityProfile';
import useActions from '@/hooks/useActions';
import { setTaskId } from '@/redux/slices/taskIdSlice';
import { useDispatch } from 'react-redux';
import ProjectActions from '../../ProjectActions';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FolderIcon from '@mui/icons-material/Folder';
import LanguageIcon from '@mui/icons-material/Language';
import TaskIcon from '@mui/icons-material/Task';

interface IGuideProfileProps {
  id: number;
  index: string;
  value: string;
  project: IProject | null;
  commonData: ICommonData;
}

export default function Profile({ id, index, value, project, commonData }: IGuideProfileProps) {
  const { actionsData, handleActions } = useActions(id);
  const dispatch = useDispatch();
  const profile = {
    name: project?.name ? project?.name : 'No Name',
    id: project?.id,
    bottomContent: {
      user: {
        title: 'Created By',
        value: project?.created_by,
        type: 'user',
      },
      dates: [
        {
          title: 'Created At',
          value: project?.created_at,
          type: 'date',
        },
      ],
    },
    fields: [
      {
        title: 'Project Template',
        icon: <FolderIcon />,
        value: project?.project_template?.name,
        href: `project-templates/${project?.project_template?.id}`,
        type: 'nameLink',
      },
      {
        title: 'Tasks',
        icon: <TaskIcon />,
        value: (
          <MoreChips
            data={project?.tasks ? project?.tasks : []}
            propName='title'
            handleSetModal={(data: any) => {
              window.open(`/tasks`);
              dispatch(setTaskId(data.id));
            }}
          />
        ),
        type: 'component',
      },
      {
        title: 'Inner Client',
        icon: <LanguageIcon />,
        value: project?.inner_client?.name,
        type: 'text',
      },
      {
        title: 'Start Date',
        icon: <CalendarTodayIcon />,
        value: project?.start_date,
        type: 'date',
      },
      {
        title: 'End Date',
        icon: <CalendarTodayIcon />,
        value: project?.end_date,
        type: 'date',
      },
    ],
  };

  return (
    value === index && (
      <>
        <EntityProfile profile={profile} handleActions={handleActions} />

        <ProjectActions
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
