import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';
interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}
interface IPostTemplateTypes {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IPostTemplatesFilters {
  job_templates?: IPostTemplateTypes;
  translations?: IPostTemplateTypes;
  statuses?: IPostTemplateTypes;
  tools?: IPostTemplateTypes;
  created_by?: IPostTemplateTypes;
  createdAt?: IPostTemplateTypes;
}

export interface IViewProps {
  rows: Array<IPostTemplate>;
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
