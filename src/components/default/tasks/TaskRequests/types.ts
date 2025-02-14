import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface ITaskRequestsFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface ITaskRequstsFormat {
  id: number | string;
  link: string;
  object_id: number | string;
  format_id: number | string;
  description: string;
}
[];

export interface ITaskRequestsFilters {
  task_templates?: ITaskRequestsFilter;
  tasks?: ITaskRequestsFilter;
  priorities?: ITaskRequestsFilter;
  assignees?: ITaskRequestsFilter;
  professions?: ITaskRequestsFilter;

  createdAt?: ITaskRequestsFilter;
  created_by?: ITaskRequestsFilter;
}

export interface IViewProps {
  rows: Array<ITaskRequest>;
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
