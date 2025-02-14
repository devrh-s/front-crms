import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { IPriceInput } from '../../common/form/TalentPriceInputs/TalentPriceInputs';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

interface IFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

interface IProfessionFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IProfessionFilters {
  statuses?: IProfessionFilter;
  translations?: IProfessionFilter;
  groups?: IProfessionFilter;
  priority?: string;
  departments?: IProfessionFilter;
  tools?: IProfessionFilter;
  task_templates?: IProfessionFilter;
  objects?: IProfessionFilter;
  createdAt?: IProfessionFilter;
  created_by?: IFilter;
}

export interface IViewProps {
  rows: Array<IProfession>;
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
export type ProfessionFields =
  | 'name'
  | 'status_id'
  | 'translation_id'
  | 'library_id'
  | 'priority_id'
  | 'department_id'
  | 'tools'
  | 'description'
  | 'links'
  | 'task_templates';

export interface IFormInputs {
  name: string;
  status_id: number;
  translation_id: number | string;
  library_id?: number | string;
  priority_id: number;
  department_id: number | string;
  tools: number[];
  links: [];
  task_templates: number[];
  description: string;
  image_icon: any;
  reason: string;
  profession_prices: IPriceInput[];
}

export interface IProfessionActionsProps {
  id: number | null;
  visible: boolean;
  commonData: ICommonData;
  isProfile?: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}
