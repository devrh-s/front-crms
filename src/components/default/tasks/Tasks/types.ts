import { GridPaginationModel } from '@mui/x-data-grid';
import { Dayjs } from 'dayjs';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface ITaskFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

interface ITaskDateFilter {
  data: IDateFilterValues;
  mode: FilterMode;
}

export interface IGuideFormat {
  id: number | string;
  link: string;
  object_id: number | string;
  format_id: number | string;
  description: string;
}

export interface IGuide {
  id: number;
  name: string;
  tools: number[];
  objects: number[];
  entites: number[];
  guide_formats: IGuideFormat[];
}

export interface IChecklistsError {
  name: {
    message: string;
  };
}

export interface IChecklistItem {
  id: number | string | null;
  name: string;
  order?: number;
  checklist_item_id?: number;
  guides: IGuide[];
  placement_id?: number | string;
}

export interface IStepError {
  assignee_id: {
    message: string;
  };
  name: {
    message: string;
  };
  checklists: IChecklistsError[];
}

export interface IStep {
  id: number | string | null;
  name: string;
  order?: number;
  assignee: number | string | null;
  step_template_id?: number;
  checklist_items?: IChecklistItem[];
}

export interface IStepType {
  id?: string;
  order?: string | number;
  assignee_id: string | number;
  name: string;
  step_template_id: string | number;
  checklists: {
    id?: string | number;
    order?: string | number;
    name: string;
    checklist_item_id: string | number;
    guides: { id?: string | number; name: string }[];
  }[];
}

export interface ITaskFilters {
  priorities?: ITaskFilter;
  statuses?: ITaskFilter;
  task_templates?: ITaskFilter;
  startDate?: ITaskDateFilter;
  dueDate?: ITaskDateFilter;
  createdAt?: ITaskDateFilter;
  professions?: ITaskFilter;
  assignees?: ITaskFilter;
  controllers?: ITaskFilter;
  created_by?: ITaskFilter;
}

export interface IViewProps {
  rows: Array<ITask>;
  view: string;
  searchValue: string;
  loading?: boolean;
  commonData?: ICommonData;
  isSmall?: boolean;
  paginationModel: GridPaginationModel;
  pagePermissions: { [permission: string]: string };
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, id?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
}
export type TasksProfileFields = 'status_id';

export interface ITasksProfileFormInputs {
  status_id: number | string;
  task_results: [];
}

export interface ITaskProfileProps {
  id: number | string | null;
  visible: boolean;
  commonData: ICommonData;
  isProfile?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
  editActions: () => void;
}
export type TasksFields =
  | 'task_template_id'
  | 'status_id'
  | 'title'
  | 'priority_id'
  | 'controllers'
  | 'assignees'
  | 'note'
  | 'start_date'
  | 'due_date'
  | 'professions'
  | 'task_request_id';

export interface IFormInputs {
  task_template_id: number | string;
  status_id: number | string;
  priority_id: number | string;
  controllers: number[];
  assignees: number[];
  reason: string;
  title: string;
  note: string;
  professions: number[];
  start_date: string | Dayjs | null;
  due_date: string | Dayjs | null;
  parent_tasks: number[];
  task_request_id?: number | string;
  steps: [];
}

export interface ITasksActionsProps {
  id: number | string | null;
  visible: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  isProfile?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
  taskRequest?: ITaskRequest | null;
}

export interface ISelectedTemplateProps {
  template: ITaskTemplate;
  startCreationProcess: boolean;
  activeBookmark: string;
}
