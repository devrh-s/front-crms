import { useMemo } from 'react';
import {
  Box,
  Modal,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: '55%',
  maxWidth: '100%',
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: 24,
};

interface IHTMLModalProps {
  json: string;
  handleClose: () => void;
}

interface IActivityFilter {
  ind: number;
  name: string;
  value: any;
}

interface IActivityView {
  field: string;
  new_value: string | string[];
  old_value: string | string[];
}

interface ActivitiesAccordeonProps {
  name: string | number;
  details: Array<IActivityView | Array<IActivityView>>;
}

const ActivityFilter = ({ name, value, ind }: IActivityFilter) => {
  const renderedValue = useMemo(() => {
    if (typeof value === 'string') {
      return <Typography>{value}</Typography>;
    }
    if (Array.isArray(value)) {
      return <Typography>{value.join(', ')}</Typography>;
    }
    if (value && typeof value === 'object') {
      const keys = Object.keys(value);
      return (
        <Stack gap='.25rem'>
          {keys?.map((k, ind) => {
            const v = value[k];
            return (
              <Stack key={ind} flexDirection='row'>
                <Typography textTransform='capitalize'>{k}:&nbsp;</Typography>
                {Array.isArray(v) ? (
                  <Typography>{v.join(', ')}</Typography>
                ) : (
                  <Typography>{v}</Typography>
                )}
              </Stack>
            );
          })}
        </Stack>
      );
    }
  }, [value]);
  return (
    <Stack
      flexDirection='column'
      alignItems='center'
      gap='.5rem'
      sx={{
        width: 'max-content',
        paddingLeft: '3rem',
        borderLeft: ind !== 0 ? '1px solid #e0e0e0' : 'none',
      }}
    >
      <Typography fontSize='1.05rem' textTransform='capitalize'>
        {name}
      </Typography>
      {renderedValue}
    </Stack>
  );
};

const ActivityView = ({ field, old_value, new_value }: IActivityView) => {
  const oldValue = Array.isArray(old_value) ? old_value.join(', ') : old_value;
  const newValue = Array.isArray(new_value) ? new_value.join(', ') : new_value;
  return (
    <Stack
      sx={{
        flexDirection: 'row',
      }}
    >
      <Stack flexDirection='column' alignItems='center' sx={{ width: '100%' }}>
        <Typography fontWeight={500} fontSize='1.25rem'>
          Field
        </Typography>
        <Typography>{field ? field : '-'}</Typography>
      </Stack>
      <Stack flexDirection='column' alignItems='center' sx={{ width: '100%' }}>
        <Typography fontWeight={500} fontSize='1.25rem'>
          New Value
        </Typography>
        <Typography>{newValue}</Typography>
      </Stack>
      <Stack flexDirection='column' alignItems='center' sx={{ width: '100%' }}>
        <Typography fontWeight={500} fontSize='1.25rem'>
          Old Value
        </Typography>
        <Typography>{oldValue}</Typography>
      </Stack>
    </Stack>
  );
};

const ActivitiesAccordeon = ({ name, details }: ActivitiesAccordeonProps) => {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls='panel1-content'
        id='panel1-header'
      >
        {name}
      </AccordionSummary>
      <AccordionDetails
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {details?.map((el, ind) => {
          if (Array.isArray(el)) {
            return <ActivitiesAccordeon key={ind} name={ind + 1} details={el} />;
          }
          return (
            <ActivityView
              key={ind}
              field={el.field}
              old_value={el.old_value}
              new_value={el.new_value}
            />
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
};

export default function ActivitiesDescription({ json, handleClose }: IHTMLModalProps) {
  const note = json ? JSON.parse(json) : {};
  const values = note?.values;
  const filters = note?.filters;
  const valuesKeys = Object.keys(values ?? [])?.filter((v) => v !== 'Profile');
  const filtersKey = Object.keys(filters ?? []);

  return (
    <Modal open={!!json} onClose={handleClose}>
      <Box sx={style}>
        <Stack
          sx={{
            padding: '3rem',
            overflow: 'auto',
            maxHeight: '80dvh',
          }}
          gap='2rem'
        >
          <Stack justifyContent='center' flexDirection='row' gap='9rem'>
            <Stack alignItems='center' gap='.5rem'>
              <Typography fontWeight={500} fontSize='1.25rem'>
                IP
              </Typography>
              <Typography>{note?.ip}</Typography>
            </Stack>
            <Stack alignItems='center' gap='.5rem'>
              <Typography fontWeight={500} fontSize='1.25rem'>
                Platform
              </Typography>
              <Typography>{note?.platform}</Typography>
            </Stack>
            <Stack alignItems='center' gap='.5rem'>
              <Typography fontWeight={500} fontSize='1.25rem'>
                Browser
              </Typography>
              <Typography>{note?.browser}</Typography>
            </Stack>
          </Stack>
          <Stack flexDirection='row'>
            <Stack
              alignItems='center'
              flexGrow={1}
              gap='.5rem'
              sx={{
                minWidth: '50%',
              }}
            >
              <Typography fontWeight={500} fontSize='1.25rem'>
                Message
              </Typography>
              <Typography>{note?.message}</Typography>
            </Stack>
            {note?.reason && (
              <Stack
                alignItems='center'
                flexGrow={1}
                gap='.5rem'
                sx={{
                  minWidth: '50%',
                }}
              >
                <Typography fontWeight={500} fontSize='1.25rem'>
                  Reason
                </Typography>
                <Typography>{note.reason}</Typography>
              </Stack>
            )}
          </Stack>
          {values && (
            <Stack gap='.5rem'>
              <Typography alignSelf='center' fontWeight={500} fontSize='1.25rem'>
                Values
              </Typography>
              {values?.Profile && <ActivitiesAccordeon name='Profile' details={values.Profile} />}
              {valuesKeys.map((valueKey, index) => {
                const value = values[valueKey];
                return <ActivitiesAccordeon key={index} name={valueKey} details={value} />;
              })}
            </Stack>
          )}
          {filters && (
            <Stack gap='.5rem'>
              <Typography alignSelf='center' fontWeight={500} fontSize='1.25rem'>
                Filters
              </Typography>
              <Stack flexDirection='row' justifyContent='center' flexWrap='wrap' gap='3rem'>
                {filtersKey.map((key, ind) => (
                  <ActivityFilter key={ind} ind={ind} name={key} value={filters[key]} />
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Box>
    </Modal>
  );
}
