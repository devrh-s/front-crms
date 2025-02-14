import {
  Autocomplete,
  AutocompleteCloseReason,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Popper,
  Stack,
  TextField,
} from '@mui/material';
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { FieldError, Merge } from 'react-hook-form';
import CustomLabel from '../CustomLabel/CustomLabel';

interface ICustomSelectProps {
  type: string;
  options: Array<IOption>;
  error?: Merge<FieldError, (FieldError | undefined)[]>;
  value: any[];
  style?: any;
  required?: boolean;
  isFilters?: boolean;
  link?: string;
  disabled?: boolean;
  handleChange: (ids: any[]) => void;
  handleClick?: (data: any) => void;
}

const selectAllMax = 50;

export default function CustomSelect({
  type,
  options,
  style,
  value,
  error,
  link,
  required = false,
  isFilters = false,
  disabled = false,
  handleChange,
  handleClick,
}: ICustomSelectProps) {
  const selectedValue = useMemo(
    () => (options ? options.filter((el) => value?.includes(el.id)) : []),
    [value, options]
  );
  const [selectAllVisible, setSelectAllVisible] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  const checkAllClick = (e: MouseEvent) => {
    e.preventDefault();
    const regex = new RegExp(inputValue, 'i');
    const oldValue = value ?? [];
    const newValue = options
      .filter((el) => el.name.search(regex) !== -1 && !oldValue?.includes(el.id))
      .map((el) => el.id);
    setInputValue('');
    handleChange([...oldValue, ...newValue]);
  };

  const clearAllClick = (e: MouseEvent) => {
    e.preventDefault();
    setInputValue('');
    handleChange([]);
  };

  useEffect(() => {
    const filtered = options?.filter((option) =>
      option.name?.toLowerCase().includes(inputValue?.toLowerCase())
    );
    if (filtered?.length <= selectAllMax) {
      setSelectAllVisible(true);
    } else {
      setSelectAllVisible(false);
    }
  }, [inputValue]);

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={options ?? []}
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
          <Chip
            {...getTagProps({ index })}
            key={index}
            variant='outlined'
            label={option.name}
            avatar={<Avatar src={option.image}>{option.name?.[0]}</Avatar>}
            onClick={() => handleClick && handleClick(option)}
          />
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
                {(!isFilters || selectAllVisible) && (
                  <Button variant='contained' color='success' onMouseDown={checkAllClick}>
                    Select All
                  </Button>
                )}
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
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          variant='standard'
          error={!!error}
          helperText={error ? error.message : ''}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          label={<CustomLabel label={type.split('_').join(' ')} link={link} required={required} />}
          sx={{ '& .MuiInputBase-root': { height: '100%' } }}
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
