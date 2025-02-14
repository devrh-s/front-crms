import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  currencies: 'currencies?is_group=1&perPage=-1&isShort=1&isCommon=1',
  salary_types: 'salary-types?is_group=1&perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
