import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

export enum TokensVariant {
  EMPTY,
  SETTINGS,
  TABLE,
}

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

export interface ITokenFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface ITokenType {
  id: number;
  name: string;
  description: string;
  token: string;
  created_by: IUser;
  created_at: string;
  expired_at?: string;
}

export interface ITokensFilters {
  created_by?: ITokenFilter;
  createdAt?: ITokenFilter;
  expiredAt?: ITokenFilter;
}

export interface IViewProps {
  rows: Array<ITokenType>;
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
}
