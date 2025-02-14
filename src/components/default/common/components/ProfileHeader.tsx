import TabIcon from '@mui/icons-material/Tab';
import { Stack, Tab, Tabs } from '@mui/material';
import Image from 'next/image';
import { SyntheticEvent, useState } from 'react';
import { ITabBookmark } from '../types';

function a11yProps(tabName: string) {
  return {
    value: tabName,
    id: `simple-tab-${tabName}`,
    'aria-controls': `simple-tabpanel-${tabName}`,
  };
}

interface IProfileHeaderProps {
  value: string;
  tabs: ITabBookmark[] | null;
  title?: string;
  handleChange: (event: SyntheticEvent, newValue: string) => void;
}

export default function ProfileHeader({ value, tabs, title, handleChange }: IProfileHeaderProps) {
  return (
    <Stack
      flexDirection='column'
      gap='.5rem'
      justifyContent='space-between'
      sx={{
        position: 'relative',
        padding: '1rem 0 0',
      }}
    >
      <Tabs
        variant='scrollable'
        value={value}
        onChange={handleChange}
        aria-label='basic tabs example'
        sx={{
          minHeight: '2.75rem',
          '.MuiTabs-indicator': {
            display: 'none',
          },
          '.MuiTabs-flexContainer': {
            height: '100%',
            alignItems: 'flex-end',
            gap: '0.5rem',
          },
        }}
        textColor='inherit'
      >
        {tabs?.map((tab) => (
          <Tab
            sx={{
              backgroundColor: tab.color,
              color: 'white',
              minHeight: value === tab.name ? '2.75rem' : '2rem',
              maxHeight: value === tab.name ? '2.75rem' : '2rem',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              padding: '0 0.75rem',
              textTransform: 'capitalize',
              transition: 'all .2s ease-in',
              opacity: 1,
              gap: '0.5rem',
            }}
            icon={<TabIconWithFallback src={tab.icon} alt={tab.name} />}
            iconPosition='start'
            key={tab.id}
            label={tab.front_name}
            {...a11yProps(tab.name)}
          />
        ))}
      </Tabs>
    </Stack>
  );
}

const TabIconWithFallback = ({ src, alt }: { src: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  return hasError || !src ? (
    <TabIcon />
  ) : (
    <Image src={src} alt={alt} width={24} height={24} onError={() => setHasError(true)} />
  );
};
