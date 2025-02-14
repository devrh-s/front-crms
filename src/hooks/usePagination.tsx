import { useState, useRef } from 'react';
import { GridPaginationModel } from '@mui/x-data-grid';

const initialValue = {
  page: 0,
  pageSize: 15,
};

const initialPrevValue = {
  page: 0,
  pageSize: 0,
};

export default function usePagination(startValue?: GridPaginationModel | null) {
  const [rowCount, setRowCount] = useState<number>(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(
    startValue ?? initialValue
  );
  const prevPaginationModel = useRef({
    page: 0,
    pageSize: 0,
  });

  const handlePagination = (newPaginationModel: GridPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  const handlePageNumber = (page: number) => {
    setPaginationModel((prev) => ({ ...prev, page }));
  };

  const handleRowCount = (rowCount: number) => {
    setRowCount(rowCount);
  };

  const defaultPagination = () => {
    prevPaginationModel.current = initialPrevValue;
    setPaginationModel(initialValue);
  };

  const checkPagination = (paginationModel: GridPaginationModel) => {
    let isInvalid = false;
    if (
      prevPaginationModel.current.page === paginationModel.page &&
      prevPaginationModel.current.pageSize === paginationModel.pageSize
    ) {
      defaultPagination();
      isInvalid = true;
    } else {
      prevPaginationModel.current = paginationModel;
    }
    return isInvalid;
  };

  return {
    paginationModel,
    rowCount,
    handleRowCount,
    handlePageNumber,
    handlePagination,
    defaultPagination,
    checkPagination,
  };
}
