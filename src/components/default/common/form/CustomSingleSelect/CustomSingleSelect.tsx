import { Autocomplete, Avatar, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { FieldError } from 'react-hook-form';
import CustomLabel from '../CustomLabel/CustomLabel';

interface ICustomSingleSelectProps {
  label?: string;
  options: Array<IOption>;
  field: any;
  required?: boolean;
  error?: FieldError;
  style?: any;
  disabled?: boolean;
  link?: string;
}

export default function CustomSingleSelect({
  options,
  label,
  field,
  style,
  error,
  link,
  required = false,
  disabled = false,
}: ICustomSingleSelectProps) {
  const [selectedValue, setSelectedValue] = useState<IOption | null>(null);
  const [inputValue, setInputValue] = useState('');
  const { value, onChange } = field;

  useEffect(() => {
    //value as id can be 0
    if (value || value === 0) {
      const selected = options?.find((el) => {
        const isUnconvertable = Number.isNaN(+el.id) || Number.isNaN(+value);
        return isUnconvertable ? el.id === value : +el.id === +value;
      });
      if (selected) {
        setSelectedValue(selected);
      }
    } else {
      setSelectedValue(null);
    }
  }, [value, options]);

  return (
    <Autocomplete
      options={options}
      onChange={(_: any, newValue: IOption | null) => {
        setSelectedValue(newValue);
        onChange(newValue?.id ?? null);
      }}
      value={selectedValue}
      style={{
        flexGrow: 1,
        ...style,
      }}
      sx={{
        '& :hover .MuiAutocomplete-input, & .Mui-focused .MuiAutocomplete-input': {
          minWidth: '30px',
        },
      }}
      getOptionLabel={(option) => `${option?.name}`}
      renderOption={(props, option) => (
        <li {...props} key={option.id} style={{ display: 'flex' }}>
          <div
            style={{
              display: 'flex',
              gap: '.5rem',
              alignItems: 'center',
            }}
          >
            {option.image && <Avatar src={option.image} sx={{ width: 25, height: 25 }} />}
            {option.name}
          </div>
        </li>
      )}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          variant='standard'
          error={!!error}
          helperText={error ? error.message : ''}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          label={label && <CustomLabel label={label} required={required} link={link} />}
          InputLabelProps={{
            shrink: true,
            sx: { textTransform: 'capitalize' },
          }}
        />
      )}
    />
  );
}
