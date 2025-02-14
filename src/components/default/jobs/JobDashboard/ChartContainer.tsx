import { Box, Button, Paper, Stack, ToggleButtonGroup } from '@mui/material';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import { colors, IChartContainerProps, Toggles } from './types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

export default function ChartContainer({
  title,
  label,
  toggles,
  chartData,
  isHorizontal = false,
  isStack,
  isLine,
}: IChartContainerProps) {
  const [activeToggle, setActiveToggle] = useState<Toggles>(Toggles.Create);
  const [sort, setSort] = useState(0);

  const options = {
    indexAxis: isHorizontal ? ('y' as const) : ('x' as const),
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: `${title.charAt(0).toUpperCase() + title.slice(1)}`,
        font: {
          size: 20,
          weight: 'bold' as const,
        },
        color: '#5a5858',
      },
    },
    scales: {
      x: {
        stacked: isStack,
        grid: {
          lineWidth: 0.5,
          drawTicks: true,
          drawOnChartArea: true,
          drawBorder: true,
        },
      },
      y: {
        stacked: isStack,
        grid: {
          lineWidth: 0.5,
          drawTicks: true,
          drawOnChartArea: true,
          drawBorder: false,
        },
      },
    },
  };

  const sortedData = () => {
    const baseData = chartData[title].map((obj: any) => ({
      label: obj[label]?.iso2 || obj[label]?.name,
      values: toggles.map((tog: string) => +obj[tog][activeToggle]),
      total: toggles.reduce((sum, tog) => sum + +obj[tog][activeToggle], 0),
    }));

    if (sort === 1) {
      baseData.sort((a: any, b: any) => b.total - a.total);
    } else if (sort === 2) {
      baseData.sort((a: any, b: any) => a.total - b.total);
    } else if (sort > 1) {
      const sortIndex = sort - 3;
      baseData.sort((a: any, b: any) => b.values[sortIndex] - a.values[sortIndex]);
    }

    const filteredData =
      sort > 2
        ? baseData.map((item: any) => ({
            ...item,
            values: item.values.map((value: number, idx: number) => (idx === sort - 3 ? value : 0)),
          }))
        : baseData;

    return {
      labels: filteredData.map((item: any) => item.label),
      datasets: toggles.map((tog, idx) => ({
        label: tog,
        data: filteredData.map((item: any) => item.values[idx]),
        backgroundColor: colors[idx],
        borderColor: colors[idx],
      })),
    };
  };

  const sortOptions = [
    { id: 1, name: 'from most to least' },
    { id: 2, name: 'from least to most' },
    ...toggles.map((tog, idx) => ({ id: idx + 3, name: `${tog}` })),
  ];

  return (
    <Paper
      variant='elevation'
      elevation={1}
      sx={{ width: '100%', overflow: 'auto', border: '1px solid #b1aaaa' }}
    >
      <Stack
        padding={2}
        width={'100%'}
        minWidth={'512px'}
        minHeight={'55vh'}
        height={isHorizontal ? `${sortedData().labels.length * 2.7}vh` : '55vh'}
        spacing={1}
      >
        <Stack justifyContent={'space-between'} direction={'row'}>
          <ToggleButtonGroup sx={{ gap: '.5rem' }}>
            {Object.values(Toggles).map((toggle) => (
              <Button
                key={toggle}
                variant={activeToggle === toggle ? 'contained' : 'outlined'}
                onClick={() => setActiveToggle(toggle)}
              >
                {toggle}
              </Button>
            ))}
          </ToggleButtonGroup>

          <CustomSingleSelect
            label='Sort by'
            field={{ value: sort, onChange: (newValue: number) => setSort(newValue) }}
            options={sortOptions}
            style={{
              maxWidth: '40%',
            }}
          />
        </Stack>

        <Box height={'100%'}>
          {isLine ? (
            <Line options={options} data={sortedData()} />
          ) : (
            <Bar options={options} data={sortedData()} />
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
