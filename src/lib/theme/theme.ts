'use client';
import { Open_Sans } from 'next/font/google';
import { createTheme, ThemeOptions } from '@mui/material/styles';

const openSans = Open_Sans({
  subsets: ['latin'],
  axes: ['wdth'],
});

declare module '@mui/material/styles/createPalette' {
  interface PaletteOptions {
    menu: {
      main: string;
      contrastText: string;
    };
    menuLight: {
      main: string;
      contrastText: string;
    };
  }
}

const theme = createTheme({
  palette: {
    secondary: {
      main: '#FCB305',
    },
    menu: {
      main: '#081E2F',
      contrastText: '#FFFFFF',
    },
    menuLight: {
      main: '#FFFFFF',
      contrastText: '#6C6C6C',
    },
  },
  typography: {
    fontFamily: openSans.style.fontFamily,
  },
  components: {
    MuiFormControl: {
      defaultProps: {
        sx: {
          '& .MuiFormLabel-asterisk': {
            color: '#e53935',
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 1000,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default theme;
