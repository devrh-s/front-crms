import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IChecklistItemsFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IChecklistItemsFilters {
  tools?: IChecklistItemsFilter;
  actions?: IChecklistItemsFilter;
  objects?: IChecklistItemsFilter;
  guides?: IChecklistItemsFilter;
  createdAt?: IChecklistItemsFilter;
  updatedAt?: IChecklistItemsFilter;
  created_by?: IChecklistItemsFilter;
  is_draft?: boolean | string;
}

export interface IViewProps {
  rows: Array<IChecklistItemType>;
  view: string;
  searchValue: string;
  loading?: boolean;
  pagePermissions: { [permission: string]: string };
  paginationModel: GridPaginationModel;
  commonData?: ICommonData;
  isSmall?: boolean;
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, id?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
}
