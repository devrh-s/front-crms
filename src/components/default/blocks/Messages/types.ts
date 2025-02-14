import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';

export interface IMessage {
  id: number;
  title: string;
  text: string;
  inner_client: IInnerClient;
  message_type: IMessageType;
  translation: ILanguage;
  tools: Array<ITool>;
  entity_blocks: { id: number; name: string }[];
}

interface IMessageFilter {
  data: number[] | string;
  mode?: FilterMode;
}

export interface IMessagesFilters {
  inner_clients?: IMessageFilter;
  message_types?: IMessageFilter;
  entity_blocks?: IMessageFilter;
  tools?: IMessageFilter;
}

export interface IViewProps {
  rows: Array<IMessage>;
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
  isSmall?: boolean;
}
