import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IProjectFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IProjectsFilters {
  project_templates?: IProjectFilter;
  inner_clients?: IProjectFilter;
  tasks?: IProjectFilter;
  created_by?: IProjectFilter;
  startDate?: IProjectFilter;
  endDate?: IProjectFilter;
  createdAt?: IProjectFilter;
}

export interface IViewProps {
  rows: Array<IProject>;
  view: string;
  searchValue: string;
  loading?: boolean;
  pagePermissions: { [permission: string]: string };
  url?: string;
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  paginationModel: GridPaginationModel;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  commonData?: ICommonData;
  isSmall?: boolean | undefined;
}
