import { useState, FormEvent, useMemo, useEffect } from 'react';
import { Button, Box, Stack, useMediaQuery, Theme } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import StartIcon from '@mui/icons-material/Start';
import { IImportState, IImportData, IColumn } from './types';
import ImportSelectBlock from './ImportSelectBlock';
import { generateImportRows } from '@/lib/helpers';
import useNotification from '@/hooks/useNotification';

interface IFormInputs {
  matched_columns: string[];
}

interface IIimportDOwnloadProps {
  state: IImportState;
  setImportData: (data: IImportData) => void;
  setSkipped: (skippedColumns: number[]) => void;
  moveBack: () => void;
  setImportError: (error: string) => void;
}

export default function ImportColumnMatch({
  state,
  moveBack,
  setSkipped,
  setImportData,
}: IIimportDOwnloadProps) {
  const [loading, setLoading] = useState(false);
  const showNotification = useNotification();
  const columns = state?.data?.columns ?? [];
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { control, setValue, handleSubmit } = useForm<IFormInputs>({
    defaultValues: {
      matched_columns: [],
    },
  });

  const rows = useMemo(() => {
    const data = state?.data?.excelData ?? [];
    return generateImportRows(data);
  }, [state.data]);

  const submitHandler = handleSubmit(async (data) => {
    const columns = data.matched_columns.filter(
      (_: any, ind: number) => !state.skipped.includes(ind)
    );
    const exceptedLength = rows.length - state.skipped.length;
    if (!columns?.length) {
      showNotification('You should set at least one column', 'error');
      return;
    }
    if (columns.length !== exceptedLength) {
      showNotification('Please, fill or skip unselected columns', 'error');
      return;
    }
    const requiredColumns = state.data?.columns
      ? state.data.columns
          .filter((el: any) => el?.required.toLowerCase() === 'yes')
          .map((col: any) => col.id)
      : [];
    const errors = requiredColumns?.filter((col) => !columns?.includes(col));
    if (errors.length) {
      showNotification(`These columns are required: ${errors.join(', ')}`, 'error');
    } else {
      setImportData({
        columns,
        hasHeading: !!state?.data?.hasHeading,
        file: state?.data?.file,
      });
    }
  });

  const submitForm = (e: FormEvent) => {
    e.preventDefault();
    submitHandler();
  };

  useEffect(() => {
    if (state.data?.heading) {
      setValue('matched_columns', state.data.heading);
    }
  }, [state.data?.heading]);

  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} onSubmit={submitForm}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 345px)',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        {rows.map((_: any, index: number) => (
          <Controller
            key={index}
            control={control}
            name='matched_columns'
            render={({ field: { onChange, value } }) => (
              <ImportSelectBlock
                state={state}
                values={value}
                columns={columns as IColumn[]}
                rows={rows}
                index={index}
                onChange={onChange}
                setSkipped={setSkipped}
              />
            )}
          />
        ))}
      </Box>
      <Stack flexDirection='row' justifyContent='center' gap='1rem'>
        <Button
          variant='contained'
          size='large'
          type='submit'
          className={mdDown ? 'mobile' : ''}
          sx={{
            alignSelf: 'center',
            '&.mobile': {
              minWidth: '0',
            },
          }}
          endIcon={<StartIcon />}
        >
          Next
        </Button>
        <Button
          variant='outlined'
          size='large'
          type='submit'
          className={mdDown ? 'mobile' : ''}
          sx={{
            alignSelf: 'center',
            '&.mobile': {
              minWidth: '0',
            },
          }}
          onClick={moveBack}
        >
          Back
        </Button>
      </Stack>
    </form>
  );
}
