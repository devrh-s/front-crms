import { useState, useMemo, MouseEvent, ChangeEvent } from 'react';
import { FieldError, Merge } from 'react-hook-form';
import {
  Popper,
  Autocomplete,
  TextField,
  Box,
  Stack,
  Divider,
  Chip,
  Avatar,
  Button,
  Radio,
  FormControlLabel,
  RadioGroup,
  AutocompleteCloseReason,
} from '@mui/material';
import CustomLabel from '../CustomLabel/CustomLabel';

interface ICustomSelectProps {
  label: string;
  optionsVars: { [name: string]: Array<IOption> };
  error?: Merge<FieldError, (FieldError | undefined)[]>;
  value: { name: string; ids: any[] };
  style?: any;
  required?: boolean;
  handleChange: ({ ids, name }: { ids: any[]; name?: string }) => void;
}

export function getSwitchSelectData(data: any, keys: string[]) {
  for (let key of keys) {
    const values = data[key];
    if (values && values.length) {
      return {
        name: key,
        ids: values.map((value: any) => value.id),
      };
    }
  }
}

export default function CustomSwitchSelect({
  label,
  optionsVars,
  style,
  value,
  error,
  required = false,
  handleChange,
}: ICustomSelectProps) {
  const optionsNames = Object.keys(optionsVars);

  const selectedOptions = useMemo(() => {
    if (value?.name) {
      return optionsVars?.[value?.name] ?? [];
    }
    return [];
  }, [value?.name]);

  const selectedValue = useMemo(() => {
    return selectedOptions.filter((el) => value?.ids?.includes(el.id));
  }, [value, selectedOptions]);
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  const checkAllClick = (e: MouseEvent) => {
    e.preventDefault();
    const regex = new RegExp(inputValue, 'i');
    const oldValue = value?.ids ?? [];
    const newValue = selectedOptions
      .filter((el) => el.name.search(regex) !== -1 && !oldValue?.includes(el.id))
      .map((el) => el.id);
    setInputValue('');
    handleChange({ ids: [...oldValue, ...newValue], name: value?.name });
  };

  const clearAllClick = (e: MouseEvent) => {
    e.preventDefault();
    setInputValue('');
    handleChange({ ids: [], name: value?.name });
  };
  const handleSwitch = (e: ChangeEvent<HTMLInputElement>) => {
    handleChange({ ids: [], name: e.target.value });
  };

  return (
    <Stack sx={{ ...style }}>
      <RadioGroup
        row
        aria-labelledby='demo-controlled-radio-buttons-group'
        name='controlled-radio-buttons-group'
        value={value?.name}
        onChange={handleSwitch}
      >
        {optionsNames.map((optionName) => (
          <FormControlLabel
            key={optionName}
            value={optionName}
            control={<Radio />}
            label={optionName.split('_').join(' ')}
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </RadioGroup>
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={selectedOptions}
        value={selectedValue}
        open={open}
        style={{
          flexGrow: 1,
        }}
        sx={{
          '& :hover .MuiAutocomplete-input, & .Mui-focused .MuiAutocomplete-input': {
            minWidth: '30px',
          },
        }}
        renderTags={(tagValue, getTagProps) => {
          return tagValue.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={index}
              label={option.name}
              avatar={<Avatar src={option.image}>{option.name?.[0]}</Avatar>}
            />
          ));
        }}
        onChange={(_, newValue) => {
          const ids = newValue.map((el) => el.id);
          handleChange({ ids, name: value?.name });
          setInputValue('');
        }}
        onClose={(_, reason: AutocompleteCloseReason) => {
          if (reason === 'escape' || reason === 'blur' || reason === 'toggleInput') {
            setOpen(false);
          }
        }}
        onOpen={() => {
          setOpen(true);
        }}
        PopperComponent={(param) => {
          return (
            <Popper
              {...param}
              sx={{
                boxShadow:
                  '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
              }}
            >
              <Box
                sx={{
                  '& .MuiPaper-root': {
                    boxShadow: 'unset',
                  },
                }}
              >
                {typeof param.children !== 'function' ? param.children : ''}
              </Box>
              <Divider color='secondary' />
              <Box
                sx={{
                  backgroundColor: 'white',
                  padding: '10px 5px  ',
                  height: '60px',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                <Stack flexDirection='row' justifyContent='flex-start' gap='.5rem'>
                  <Button variant='contained' color='success' onMouseDown={checkAllClick}>
                    Select All
                  </Button>
                  <Button variant='contained' color='error' onMouseDown={clearAllClick}>
                    Clear All
                  </Button>
                </Stack>
              </Box>
            </Popper>
          );
        }}
        getOptionLabel={(option) =>
          option.entity && option.block ? option.entity.name : option.name
        }
        renderOption={(props, option) => {
          if (option) {
            return (
              <li {...props} key={option.id} style={{ display: 'flex' }}>
                <div
                  style={{
                    display: 'flex',
                    gap: '.5rem',
                    alignItems: 'center',
                  }}
                >
                  {option?.image && <Avatar src={option?.image} sx={{ width: 25, height: 25 }} />}
                  {option?.name}
                </div>
              </li>
            );
          }
          return;
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant='standard'
            error={!!error}
            helperText={error ? error.message : ''}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            label={
              <CustomLabel
                label={label.split('_').join(' ')}
                link={value?.name?.split('_').join('-')}
                required={required}
              />
            }
            InputLabelProps={{
              shrink: true,
              sx: { textTransform: 'capitalize' },
            }}
          />
        )}
        slotProps={{
          popupIndicator: {
            onClick: () => {
              setOpen((prev) => !prev);
            },
          },
        }}
      />
    </Stack>
  );
}
