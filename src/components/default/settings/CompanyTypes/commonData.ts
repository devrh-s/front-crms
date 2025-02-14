import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  inner_clients: 'inner-clients?perPage=-1&isCommon=1&isShort=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
