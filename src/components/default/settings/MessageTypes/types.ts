import { ChangeEvent, MouseEvent, KeyboardEvent } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

export interface IMessage {
  id: number;
  title: string;
  text: string;
  inner_client: IInnerClient;
  message_type: IMessageType;
}

interface IMessageFilter {
  data: number[] | string;
  mode?: FilterMode;
}

export interface IMessagesFilters {
  inner_clients?: IMessageFilter;
  message_types?: IMessageFilter;
}

export interface IViewProps {
  rows: Array<IMessageType>;
  view: string;
  searchValue: string;
  loading?: boolean;
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  paginationModel: GridPaginationModel;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  isSmall?: boolean;
}
