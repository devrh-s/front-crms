import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

export interface IGPTFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IGPTsFilters {
  owners?: IGPTFilter;
  entities?: IGPTFilter;
  tools?: IGPTFilter;
  task_templates?: IGPTFilter;
  links?: IGPTFilter;
  created_by?: IGPTFilter;
  createdAt?: IGPTFilter;
}

export interface IViewProps {
  rows: Array<IGPT>;
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
