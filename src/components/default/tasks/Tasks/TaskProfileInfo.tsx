'use client';

import { setTaskId } from '@/redux/slices/taskIdSlice';
import { useDispatch } from 'react-redux';
import MoreChips from '../../common/components/MoreChips';
import Status from '../../common/components/Status';
import EntityProfile from '../../common/pages/EntityProfile/EntityProfile';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EngineeringSharpIcon from '@mui/icons-material/EngineeringSharp';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import NewspaperOutlinedIcon from '@mui/icons-material/NewspaperOutlined';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';

interface ITaskProfileInfoProps {
  activeBookmark: string;
  data: ITask;
  editActions: any;
  setValue: any;
  setStatusTask: any;
}

export default function TaskProfileInfo({
  activeBookmark,
  data,
  editActions,
  setValue,
  setStatusTask,
}: ITaskProfileInfoProps) {
  const dispatch = useDispatch();
  const profile = {
    name: data?.title,
    id: data?.id,
    fields: [
      {
        title: 'Parent task',
        icon: <NewspaperOutlinedIcon />,
        value: (
          <MoreChips
            data={data?.parent_tasks ? data.parent_tasks : []}
            propName='title'
            handleSetModal={(data: any) => {
              window.open('/tasks');
              dispatch(setTaskId(data.id));
            }}
          />
        ),
        type: 'component',
      },
      {
        title: 'Parent task results',
        icon: <NewspaperOutlinedIcon />,
        value: data?.parent_task_results?.map((el) => ({
          id: el.id,
          name: `${el.model}: ${el.result}`,
          model_id: el.model_id,
        })),
        type: 'moreChips',
      },
      {
        title: 'Status',
        icon: <StackedBarChartIcon />,
        value: (
          <Status
            name={data?.status.name}
            color={data?.status.color}
            onClick={() => {
              setStatusTask(data);
              setValue('status_id', data.status.id);
            }}
          />
        ),
        type: 'text',
      },
      {
        title: 'Priority',
        icon: <LowPriorityIcon />,
        value: data?.priority.name,
        type: 'text',
      },
      {
        title: 'Task template',
        icon: <NewspaperIcon />,
        value: data?.task_template.name,
        href: `/task-templates/${data?.task_template.id}`,
        type: 'nameLink',
      },
      {
        title: 'Steps',
        icon: <FormatListNumberedIcon />,
        value: data?.steps,
        type: 'moreChips',
      },
      // {
      //   title: "Is completed",
      //   value: data?.is_completed === 0 ? "NO" : "YES",
      //   type: "text",
      // },
      {
        title: 'Assignees',
        icon: <GroupOutlinedIcon />,
        value: data?.assignees,
        type: 'moreChips',
      },
      {
        title: 'Professions',
        icon: <EngineeringSharpIcon />,
        value: data?.professions,
        type: 'moreChips',
      },
      {
        title: 'Controllers',
        icon: <GroupOutlinedIcon />,
        value: data?.controllers,
        type: 'moreChips',
      },

      {
        title: 'Start date',
        icon: <CalendarTodayIcon />,
        value: data?.start_date,
        type: 'date',
        format: 'DD-MM-YYYY 🕒 HH:mm:ss',
      },
      {
        title: 'Due date',
        icon: <CalendarTodayIcon />,
        value: data?.due_date,
        type: 'date',
        format: 'DD-MM-YYYY 🕒 HH:mm:ss',
      },
      {
        title: 'Total time',
        icon: <AccessTimeIcon />,
        value: data?.total_time,
        type: 'text',
      },
    ],
    // accordions: [
    //   {
    //     title: 'note',
    //     content: data?.note,
    //   },
    // ],
  };

  return (
    <>
      {activeBookmark === 'profile' && (
        <EntityProfile profile={profile} isDrawer={true} handleActions={() => editActions()} />
      )}
    </>
  );
}
