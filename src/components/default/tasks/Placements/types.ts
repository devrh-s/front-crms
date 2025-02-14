import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

interface IPlacement {
  id: number;
  name: string;
  link: string;
}

interface PlacementType {
  id: number;
  name: string;
}

interface Account {
  id: number;
  name: string;
  link: string;
}

export interface IPlacementType {
  id: number;
  name: string;
  tool: ITool;
  link?: string;
  placement_type: PlacementType;
  accounts?: Array<Account>;
}

interface IPlacementTypes {
  data: number[] | string;
  mode?: FilterMode;
}

export interface IPlacementTypeFilters {
  tools?: IPlacementTypes;
  placement_types?: IPlacementTypes;
  accounts?: IPlacementTypes;
}

export interface IViewProps {
  rows: Array<IPlacementType>;
  view: string;
  searchValue: string;
  loading?: boolean;
  paginationModel: GridPaginationModel;
  commonData?: ICommonData;
  isSmall?: boolean | undefined;
  pagePermissions: { [permission: string]: string };
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
}
