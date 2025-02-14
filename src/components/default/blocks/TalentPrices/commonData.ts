import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  rates: 'rates?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  currencies: 'currencies?perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
