import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface ITaskTemplatesFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

interface ITaskTemplatesDateFilter {
  data: IDateFilterValues;
  mode?: FilterMode;
}

export interface IGuideFormat {
  id: number | string;
  link: string;
  object_id: number | string;
  format_id: number | string;
  description: string;
}

export interface IGuide {
  id: number;
  name: string;
  tools: number[];
  objects: number[];
  entites: number[];
  guide_formats: IGuideFormat[];
}

export interface IChecklistItem {
  id: number | string | null;
  name: string;
  order?: number;
  checklist_item_id?: number;
  guides: IGuide[];
  placement_id?: number | string;
}

export interface IStep {
  id: number | string | null;
  name: string;
  order?: number;
  assignee: number | string | null;
  step_template_id?: number;
  checklist_items?: IChecklistItem[];
}

export interface IGuidesInfo {
  data: {
    name: string;
    id: number | string;
    checklist_items: IChecklistItemType[];
    tool?: ITool | {};
  };
}

export interface ITaskTemplatesFilters {
  step_templates?: ITaskTemplatesFilter;
  professions?: ITaskTemplatesFilter;
  frequencies?: ITaskTemplatesFilter;
  actions?: ITaskTemplatesFilter;
  objects?: ITaskTemplatesFilter;
  tools?: ITaskTemplatesFilter;
  created_by?: ITaskTemplatesFilter;
  createdAt?: ITaskTemplatesDateFilter;
  is_draft?: boolean | string;
}

export interface IViewProps {
  rows: Array<ITaskTemplate>;
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
