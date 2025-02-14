import { useState } from 'react';

export default function useModal(): [string, (v: string) => void] {
  const [value, setValue] = useState('');

  const handleSetValue = (newValue: string) => setValue(newValue);

  return [value, handleSetValue];
}
