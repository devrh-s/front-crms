import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

export interface IUnconfirmedUsersFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}
export interface IUsersFilters {
  createdAt?: IUnconfirmedUsersFilter;
}

export interface IViewProps {
  rows: Array<IUser>;
  view: string;
  searchValue: string;
  loading?: boolean;
  paginationModel: GridPaginationModel;
  isSmall?: boolean | undefined;
  pagePermissions: { [permission: string]: string };
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  handleConfirm: (userId: number) => void;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
}
