import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

interface IPlacementTypes {
  data: number[] | string;
  mode?: FilterMode;
}

export interface IProjectTemplatesFilters {
  task_templates?: IPlacementTypes;
  milestone_templates?: IPlacementTypes;
}

export interface IViewProps {
  rows: Array<IProjectTemplate>;
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

export interface ITaskTemplate {
  id: number;
  name: string;
  step_templates: IStepTemplate[];
}

export interface IStepTemplate {
  id: number;
  name: string;
  checklist_items: IChecklistItem[];
}

export interface IChecklistItem {
  id: number;
  name: string;
  guides: IGuide[];
}

export interface IGuide {
  id: number;
  name: string;
}
