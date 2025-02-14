import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  rates: 'rates?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  shifts: 'shifts?perPage=-1&isShort=1&isCommon=1',
  inner_clients: 'inner-clients?perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
