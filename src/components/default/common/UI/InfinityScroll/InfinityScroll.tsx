import { useRef, useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import { GridPaginationModel } from '@mui/x-data-grid';

interface IInfinityScrollProps {
  paginationModel: GridPaginationModel;
  handleCardsStorage?: (value: boolean) => void;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
}

export default function InfinityScroll({
  paginationModel,
  handleCardsStorage,
  handlePagination,
}: IInfinityScrollProps) {
  const observerTarget = useRef(null);
  const counter = useRef(paginationModel.page);
  const observer = useMemo(
    () =>
      new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            counter.current += 1;
            const newPaginationModel = {
              ...paginationModel,
              page: counter.current,
            };
            if (handleCardsStorage) {
              handleCardsStorage(true);
            }
            handlePagination(newPaginationModel);
          }
        },
        { threshold: 0 }
      ),
    []
  );
  useEffect(() => {
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget]);

  useEffect(() => {
    if (counter.current - paginationModel.page !== 0) {
      counter.current = paginationModel.page;
    }
  }, [paginationModel]);

  return <Box ref={observerTarget} sx={{ height: '1px' }}></Box>;
}
