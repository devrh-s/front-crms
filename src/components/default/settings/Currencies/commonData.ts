import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  currencies: 'currencies?perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
