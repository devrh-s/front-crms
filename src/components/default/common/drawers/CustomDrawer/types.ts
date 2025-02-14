import { ReactElement } from 'react';
import { Theme, Palette } from '@mui/material';

export interface IMenuItem {
  id?: string;
  subheader?: string;
  navlabel?: boolean;
  title?: string;
  type?: string;
  icon?: ReactElement;
  href?: string;
  active?: boolean;
  childItems?: Array<IMenuItem> | undefined;
}

export interface INavSubDesk {
  open: boolean;
  name: string;
  items: IMenuItem[] | [];
}

export interface IExtendedPalette extends Palette {
  menu: {
    main: string;
    contrastText: string;
  };
}

export interface IMenuTheme extends Theme {
  palette: IExtendedPalette;
}
