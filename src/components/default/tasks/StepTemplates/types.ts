import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IStepTemplatesFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}
export interface IGuidesInfo {
  name: string;
  id?: string | number;
  guides: IGuideType[];
}

export interface IStepTemplatesFilters {
  checklist_items?: IStepTemplatesFilter;
  guides?: IStepTemplatesFilter;
  actions?: IStepTemplatesFilter;
  objects?: IStepTemplatesFilter;
  tools?: IStepTemplatesFilter;
  updatedAt?: IStepTemplatesFilter;
  createdAt?: IStepTemplatesFilter;
  created_by?: IStepTemplatesFilter;
  is_draft?: boolean | string;
}

export interface IViewProps {
  rows: Array<IStepTemplate>;
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
