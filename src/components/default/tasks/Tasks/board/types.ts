import { Dispatch, SetStateAction } from 'react';

export interface User {
  id: number;
  name: string;
  image: string;
}

interface Priority {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  assignees: User[];
  controllers: User[];
  count_completed_steps: number;
  count_edits: number;
  count_incompleted_steps: number;
  is_completed: number;
  priority: Priority;
  title: string;
  color: string;
  order: number;
  setIdProfile: Dispatch<SetStateAction<number | null>>;
}

export interface TasksData {
  id: number;
  color: string;
  name: string;
  count_tasks: number;
  current_tasks: number;
  tasks: Task[];
}

export interface TaskBoardData {
  data: TasksData[];
  entity_block_profile_id: number;
}
