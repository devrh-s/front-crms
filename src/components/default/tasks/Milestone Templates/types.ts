import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

interface IPlacementTypes {
  data: number[] | string;
  mode?: FilterMode;
}

export interface IMilestoneTemplatesFilters {
  task_templates?: IPlacementTypes;
}

export interface IViewProps {
  rows: Array<IMilestoneTemplate>;
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
