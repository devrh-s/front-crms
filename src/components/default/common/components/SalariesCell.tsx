import { Stack, Tooltip } from '@mui/material';
import Text from './Text';
import dayjs from 'dayjs';

interface ISalariesCellProps {
  salaries: ISalary[];
}

export default function SalariesCell({ salaries }: ISalariesCellProps) {
  return (
    <Stack flexDirection={'row'} gap={'1rem'}>
      {salaries.map((item: any, i: number) => (
        <Tooltip
          key={i}
          title={
            <Stack flexDirection={'column'}>
              <Text text={`Salary Type: ${item.salary_type?.name}`} />
              <Text
                text={`Currency: ${item.value}${item.currency?.symbol} (${item.currency?.name})`}
              />
              <Text
                text={`Hourly: ${item.hourly_cost}${item.hourly_currency?.symbol} (${item.hourly_currency?.name})`}
              />
              <Text
                text={`Start Date: ${item?.start_date ? dayjs(item?.start_date).format('DD-MM-YYYY') : '-'}`}
              />
              <Text
                text={`End Date: ${item?.end_date ? dayjs(item?.end_date).format('DD-MM-YYYY') : '-'}`}
              />
            </Stack>
          }
        >
          <Stack flexDirection={'column'}>
            <Text text={`${item.value}${item.currency?.symbol} (${item.salary_type?.name})`} />
            <Text text={`${item.hourly_cost}${item.hourly_currency?.symbol}`} />
          </Stack>
        </Tooltip>
      ))}
    </Stack>
  );
}
