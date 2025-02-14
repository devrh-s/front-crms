import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

export interface IAccountFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IAccountsFilters {
  inner_clients?: IAccountFilter;
  tools?: IAccountFilter;
  statuses?: IAccountFilter;
  users?: IAccountFilter;
  owners?: IAccountFilter;
  createdAt?: IAccountFilter;
  passCreatedAt?: IAccountFilter;
  passNextChangeDate?: IAccountFilter;
  created_by?: IAccountFilter;
}

export interface IViewProps {
  rows: Array<IAccount>;
  view: string;
  searchValue: string;
  loading?: boolean;
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
  isSmall?: boolean;
  pagePermissions: { [permission: string]: string };
}
