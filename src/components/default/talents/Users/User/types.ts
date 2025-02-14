import { ChangeEvent } from 'react';

interface IAntityBlock {
  id: number;
}

export interface IUserActivity {
  id: number;
  timestamp: string;
  url: string;
  entityblock: IAntityBlock;
  description: string;
  action: string;
}

export interface IViewProps {
  rows: Array<IUserActivity>;
  view: string;
  searchValue: string;
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  handleChangeView: (_: React.MouseEvent<HTMLElement>, newView: string) => void;
}
