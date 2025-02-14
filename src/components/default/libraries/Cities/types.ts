import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface ICityFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

interface IFilter {
  data: number[] | string;
  mode?: FilterMode;
}

export interface ICitiesFilters {
  countries?: ICityFilter;
  groups?: ICityFilter;
  translations?: ICityFilter;
  statuses?: ICityFilter;
  priority?: string;
  createdAt?: ICityFilter;
  createdAtEnd?: string | null;
  created_by?: IFilter;
}

export interface IViewProps {
  rows: Array<ICity>;
  view: string;
  searchValue: string;
  loading?: boolean;
  pagePermissions: { [permission: string]: string };
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
