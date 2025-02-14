import { useState, useMemo, MouseEvent } from 'react';
import { FieldError } from 'react-hook-form';
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
  AutocompleteCloseReason,
  Tooltip,
} from '@mui/material';
import CustomLabel from '../CustomLabel/CustomLabel';

interface ICustomSelectProps {
  type: string;
  options: Array<IOption>;
  error?: FieldError;
  value: any[];
  style?: any;
  handleChange: (ids: any[]) => void;
  required?: boolean;
  click: any;
}

export default function CustomClickSelect({
  type,
  options,
  style,
  value,
  error,
  required = false,
  handleChange,
  click,
}: ICustomSelectProps) {
  const selectedValue = useMemo(
    () => options.filter((el) => value?.includes(el.id)),
    [value, options]
  );
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  const checkAllClick = (e: MouseEvent) => {
    e.preventDefault();
    const regex = new RegExp(inputValue, 'i');

    const newValue = options
      .filter((el) => el.name.search(regex) !== -1 && !value.includes(el.id))
      .map((el) => el.id);
    setInputValue('');
    handleChange([...value, ...newValue]);
  };

  const clearAllClick = (e: MouseEvent) => {
    e.preventDefault();
    setInputValue('');
    handleChange([]);
  };

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={options}
      value={selectedValue}
      open={open}
      style={{
        flexGrow: 1,
        ...style,
      }}
      sx={{
        '& :hover .MuiAutocomplete-input, & .Mui-focused .MuiAutocomplete-input': {
          minWidth: '30px',
        },
      }}
      renderTags={(tagValue, getTagProps) => {
        return tagValue.map((option, index) => (
          <Tooltip
            key={index}
            title={
              option.guides
                ? option.guides?.map((guide: any) => `Guide (ID:${guide.id}):${guide.name}; `)
                : null
            }
            placement='bottom-end'
          >
            <Chip
              {...getTagProps({ index })}
              color='primary'
              onClick={() => {
                click(option);
              }}
              key={index}
              label={option.name}
              avatar={<Avatar src={option.image}>{option.name[0]}</Avatar>}
            />
          </Tooltip>
        ));
      }}
      onChange={(_, newValue) => {
        const ids = newValue.map((el) => el.id);
        handleChange(ids);
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
          label={<CustomLabel label={type.split('_').join(' ')} required={required} />}
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
  );
}
