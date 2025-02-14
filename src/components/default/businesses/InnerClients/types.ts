import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

interface IInnerClientFilter {
  data: number[] | string;
  mode?: FilterMode;
}

export interface IInnerClientFilters {
  company_types?: IInnerClientFilter;
}

export interface IViewProps {
  rows: Array<IInnerClient>;
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
