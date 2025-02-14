import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

export interface IViewProps {
  rows: Array<ICountry>;
  view: string;
  searchValue: string;
  loading?: boolean;
  pagePermissions: { [permission: string]: string };
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  paginationModel: GridPaginationModel;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  commonData?: ICommonData;
  isSmall?: boolean | undefined;
}
interface ICountryFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

interface IFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}
export interface ICountriesFilters {
  // cities?: ICountryFilter
  groups?: ICountryFilter;
  translations?: ICountryFilter;
  statuses?: ICountryFilter;
  priority?: string;
  createdAt?: ICountryFilter;
  createdAtEnd?: string | null;
  created_by?: IFilter;
}
