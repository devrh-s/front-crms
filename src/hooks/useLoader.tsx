import { useState } from 'react';

export default function useLoader() {
  const [loading, setLoading] = useState(false);

  const startLoading = () => {
    setLoading(true);
  };

  const finishLoading = () => {
    setLoading(false);
  };
  return { loading, startLoading, finishLoading };
}
