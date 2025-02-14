import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Stack,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  Tooltip,
  Theme,
} from '@mui/material';
import Card from '@mui/material/Card';
import { PieChart } from '@mui/x-charts/PieChart';
import { IViewProps, IReportLanguages } from './types';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import CardsSlider from '@/components/default/common/components/CardsSlider';
import CustomChip from '../../common/components/CustomChip';

interface ILanguageCard {
  elem: IReportLanguages;
}

const tooltipTitles = {
  js: 'Job Sites',
  jt: 'Job Templates',
  jp: 'Job Posts',
};

function LanguageCard({ elem }: ILanguageCard) {
  const [view, setView] = useState('main');
  const handleChange = (_: any, newView: string) => {
    setView(newView);
  };

  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const fields = { ...elem };
  delete fields?.language;
  delete fields?.country;
  delete fields?.id;
  const fieldsKeys = Object.keys(fields);
  const chartData = useMemo(() => {
    const data = [];
    for (const [key, value] of Object.entries(elem.total)) {
      data.push({
        label: key,
        value,
      });
    }
    return data;
  }, [elem]);

  const series: any = [
    {
      data: chartData,
      innerRadius: 55,
      outerRadius: 100,
      paddingAngle: 0,
      cornerRadius: 0,
      startAngle: -180,
      endAngle: 180,
      cx: 200,
      cy: 100,
    },
  ];

  return (
    <Stack>
      <ToggleButtonGroup value={view} exclusive onChange={handleChange}>
        <ToggleButton
          value='main'
          sx={{
            border: 'none',
            borderBottomLeftRadius: 0,
            '&.MuiButtonBase-root': {
              height: '2rem',
              color: view === 'main' ? '#fff' : '#636363',
              backgroundColor: view === 'main' ? '#1976d2' : '#fff',
              borderTopRightRadius: '4px',
            },
          }}
        >
          Main
        </ToggleButton>
        <ToggleButton
          value='total'
          sx={{
            border: 0,
            borderBottomRightRadius: 0,
            '&.MuiButtonBase-root': {
              height: '2rem',
              color: view === 'total' ? '#fff' : '#636363',
              backgroundColor: view === 'total' ? '#1976d2' : '#fff',
              borderTopRightRadius: '4px',
            },
          }}
        >
          Total
        </ToggleButton>
      </ToggleButtonGroup>
      <Card
        className={mdDown ? 'mobile' : ''}
        sx={{
          width: 345,
          height: 'calc(100% - 2rem)',
          borderTopLeftRadius: 0,
          borderBottom: '7px solid #1976d2',
          '&.mobile': {
            width: 'auto',
            maxWidth: 345,
          },
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            padding: '1rem',
            flexDirection: 'column',
            minHeight: '16rem',
            height: 'inherit',
            gap: '1.5rem',
          }}
        >
          {view === 'main' && (
            <Stack sx={{ minHeight: 'inherit' }} gap='1rem'>
              <CustomChip
                label={elem?.language?.name}
                data={
                  {
                    name: elem?.language?.name,
                    image: elem?.language?.image ?? '/images/question_mark.svg',
                  } as any
                }
              />
              <CardsSlider>
                {fieldsKeys.map((key) => {
                  const field = elem[key as keyof typeof fields]!;
                  const filedKeys = Object.keys(field);
                  return (
                    <Stack
                      key={key}
                      sx={{
                        display: 'flex!important',
                        minHeight: '8rem',
                        gap: '1rem',
                      }}
                    >
                      <Typography
                        sx={{
                          textAlign: 'center',
                          textTransform: 'capitalize',
                          fontWeight: 600,
                        }}
                      >
                        {key}
                      </Typography>
                      <Stack flexDirection='row' gap='1rem' sx={{ padding: '0 2rem' }}>
                        {filedKeys.map((k) => (
                          <Stack key={`${key}-${k}`} justifyContent='center' alignItems='center'>
                            <Tooltip
                              title={tooltipTitles[k as keyof typeof tooltipTitles]}
                              placement='top'
                            >
                              <Typography textTransform='capitalize'>{k}</Typography>
                            </Tooltip>
                            <Stack
                              sx={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '3rem',
                                height: '2.7rem',
                                border: '1px solid #000',
                                borderRadius: '4px',
                              }}
                            >
                              {field[k as keyof typeof field]}
                            </Stack>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  );
                })}
              </CardsSlider>
            </Stack>
          )}
          {view === 'total' && (
            <Stack sx={{ minHeight: 'inherit' }}>
              <CustomChip
                label={elem?.language?.name}
                data={
                  {
                    name: elem?.language?.name,
                    image: elem?.language?.image ?? '/images/question_mark.svg',
                  } as any
                }
              />
              <PieChart
                series={series}
                slotProps={{
                  legend: {
                    direction: 'column',
                    position: { vertical: 'middle', horizontal: 'left' },
                    padding: 0,
                  },
                }}
              />
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

export default function LanguagesCards({
  rows,
  toggleFilters,
  searchValue,
  handleSearch,
  view,
  cardsStorageActive,
  handleCardsStorage,
  handleChangeView,
}: IViewProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [visibleCards, setVisibleCards] = useState<typeof rows>([]);
  useEffect(() => {
    if (cardsStorageActive) {
      setVisibleCards((prev) => [...prev, ...rows]);
      handleCardsStorage(false);
    } else {
      setVisibleCards(rows);
    }
  }, [rows]);
  return (
    <Stack
      gap='2rem'
      sx={{
        padding: '.5rem 0',
        minHeight: mdDown ? 'calc(80dvh - 2rem - 64px)' : 'calc(80dvh - 2rem - 56px)',
      }}
    >
      <CustomToolbar
        view={view}
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        pageName='Languages'
      />
      <Box
        className={mdDown ? 'mobile' : ''}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 345px)',
          justifyContent: 'center',
          gap: '1rem',
          '&.mobile': {
            display: 'flex',
            flexDirection: 'column',
            rowGap: '12px',
            alignItems: 'center',
            minHeight: '100dvh',
          },
        }}
      >
        {visibleCards.map((row) => (
          <LanguageCard key={row.id} elem={row} />
        ))}
      </Box>
    </Stack>
  );
}
