import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import Notifications from '@/components/default/common/UI/Notifications/Notifications';
import SnowWrapper from '@/components/default/common/UI/Snow/SnowWrapper';
import { SocketContextProvider } from '@/contexts/socketContext';
import CustomQueryClient from '@/components/default/common/core/CustomQueryClient';
import { Open_Sans } from 'next/font/google';
import StoreProvider from '@/redux/provider';
import '@/lib/css/globals.css';
import theme from '@/lib/theme/theme';

const openSans = Open_Sans({
  subsets: ['latin'],
  axes: ['wdth'],
});

export const metadata: Metadata = {
  title: 'CRM',
  description: 'CRM Next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={openSans.className}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <SnowWrapper>
              <StoreProvider>
                <SocketContextProvider>
                  <CustomQueryClient>
                    <Notifications>{children}</Notifications>
                  </CustomQueryClient>
                </SocketContextProvider>
              </StoreProvider>
            </SnowWrapper>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
