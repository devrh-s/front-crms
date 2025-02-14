import { useState, ChangeEvent } from 'react';
import useDebounce from './useDebounce';

export default function useSearch() {
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 500);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
  };

  const clearSearch = () => {
    setSearchValue('');
  };

  return { searchValue, debouncedSearchValue, handleSearch, clearSearch };
}
