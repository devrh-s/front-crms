import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

interface IJobSitesFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IJobSitesFilters {
  countries?: IJobSitesFilter;
  languages?: IJobSitesFilter;
  createdAt?: IJobSitesFilter;
  created_by?: IFilter;
}

export interface IViewProps {
  rows: Array<IJobSite>;
  view: string;
  searchValue: string;
  loading?: boolean;
  cardsStorageActive: boolean;
  pagePermissions: { [permission: string]: string };
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
