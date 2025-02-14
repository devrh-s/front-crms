import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

export type LinksFields =
  | 'name'
  | 'url'
  | 'tool_id'
  | 'inner_client_id'
  | 'status_id'
  | 'owner_id'
  | 'format_id'
  | 'object_id'
  | 'destinations'
  | 'professions';
export interface ILinksDestinations {
  destinationable_type: string;
  destinationable_ids: number[];
}
export interface IFormInputs {
  name: string;
  url: string;
  status_id: number | string;
  owner_id: number | string;
  inner_client_id: number | string;
  tool_id: number | string;
  format_id: number | string;
  description: string;
  professions: number[];
  destinations: ILinksDestinations[];
  object_id: number | string;
  reason: string;
}

export interface ILinksActionsProps {
  id: number | string | null;
  visible: boolean;
  commonData: ICommonData;
  isProfile?: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}
interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface ILinksFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface ILinksFilters {
  tools?: ILinksFilter;
  inner_clients?: ILinksFilter;
  objects?: ILinksFilter;
  owners?: ILinksFilter;
  formats?: ILinksFilter;
  statuses?: ILinksFilter;
  professions?: ILinksFilter;
  created_by?: ILinksFilter;
  createdAt?: ILinksFilter;
  updatedAt?: ILinksFilter;
}

export interface IViewProps {
  rows: Array<ILink>;
  view: string;
  searchValue: string;
  loading?: boolean;
  pagePermissions: { [permission: string]: string };
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, id?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  paginationModel: GridPaginationModel;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  commonData?: ICommonData;
  isSmall?: boolean;
}
