import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}

export interface IJaCommunication {
  id: number;
  job_application: IJobApplication;
  created_by: IUser;
  account: IAccount;
  channel: IContact;
  created_at: string;
  followup_date: string;
  followup_time: string;
  note: string;
  messages: IMessage[];
  communication_type: ICommunicationType;
}

export interface IJobApplication {
  id: number;
  name: string;
}

export interface IMessage {
  id: number;
  title: string;
  text: string;
}

interface IJaCommunicationFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

export interface IJaCommunicationsFilters {
  accounts?: IJaCommunicationFilter;
  account_tools?: IJaCommunicationFilter;
  channel_tools?: IJaCommunicationFilter;
  communication_types?: IJaCommunicationFilter;
  created_by?: IJaCommunicationFilter;
  createdAt?: IJaCommunicationFilter;
}

export interface IViewProps {
  rows: Array<IJaCommunication>;
  view: string;
  searchValue: string;
  loading?: boolean;
  availableAdd: boolean;
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
  pagePermissions: { [permission: string]: string };
}
