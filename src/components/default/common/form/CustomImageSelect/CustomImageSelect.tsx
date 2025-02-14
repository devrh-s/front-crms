import { Autocomplete, AutocompleteCloseReason, Avatar, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { FieldError } from 'react-hook-form';

interface ICustomImageSelectProps {
  type: string;
  options: Array<IOption>;
  error?: FieldError;
  value: string;
  label?: string;
  style?: any;
  tiedValue?: any;
  disabled?: boolean;
  handleChange: (image: string) => void;
}

export default function CustomImageSelect({
  type,
  options,
  label,
  style,
  value,
  error,
  tiedValue,
  handleChange,
  disabled = false,
}: ICustomImageSelectProps) {
  const [selectedValue, setSelectedValue] = useState<IOption[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let selected;
    if (value) {
      selected = options.find((el) => el.id === value);
    } else if (tiedValue && tiedValue instanceof Object) {
      const [key] = Object.keys(tiedValue);
      selected = options.find((el) => el[key as keyof typeof el] === tiedValue[key]);
    }
    if (selected) {
      handleChange(selected?.id ? (selected?.id as string) : '');
      setSelectedValue([selected]);
    } else {
      setSelectedValue([]);
    }
  }, [value, tiedValue, options]);

  return (
    <Autocomplete
      multiple
      options={options}
      onChange={(_: any, newValue: IOption[] | null) => {
        const lastValue = newValue?.pop();
        setOpen(false);
        handleChange(lastValue?.id ? (lastValue?.id as string) : '');
        setSelectedValue([lastValue!]);
      }}
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
      renderTags={(tagValue) => {
        return tagValue.map((option) => {
          if (option) {
            return (
              <div
                key={option?.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '5px 0',
                  alignItems: 'center',
                  textTransform: 'uppercase',
                }}
              >
                <Avatar src={option?.image} />
                {option?.iso2}
              </div>
            );
          }
        });
      }}
      getOptionLabel={(option) => (option?.iso2 ? option?.iso2 : '')}
      renderOption={(props, option) => {
        if (option) {
          return (
            <li {...props} key={option.id} style={{ display: 'flex', justifyContent: 'center' }}>
              {option?.image && (
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    textTransform: 'uppercase',
                  }}
                >
                  <Avatar src={option?.image} />
                  {option?.iso2}
                </div>
              )}
            </li>
          );
        }
        return;
      }}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={(_, reason: AutocompleteCloseReason) => {
        if (reason === 'escape' || reason === 'blur' || reason === 'toggleInput') {
          setOpen(false);
        }
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
          label={label ?? type.split('_').join(' ')}
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
