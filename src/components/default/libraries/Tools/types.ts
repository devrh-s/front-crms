import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

export interface ITool {
  id: number;
  name: string;
  description?: string;
  link: string;
  links?: ILink[];
  tool_types: { id: number; name: string }[];
  entity_blocks: { id: number; name: string }[];
  guides: IGuideType[];
  task_templates: { id: number; name: string }[];
}

export interface IToolType {
  id: number;
  name: string;
  tools: Array<ITool>;
}

interface IToolTypeFilter {
  data: number[] | string;
  mode?: FilterMode;
}

export interface IToolTypeFilters {
  tools?: IToolTypeFilter;
}

export interface IViewProps {
  rows: Array<ITool>;
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
interface IToolsFilter {
  data: number[] | string;
  mode?: FilterMode;
}
export interface IToolsFilters {
  blocks?: IToolsFilter;
  entities?: IToolsFilter;
  tool_types?: IToolsFilter;
  guides?: IToolsFilter;
  task_templates?: IToolsFilter;
}
