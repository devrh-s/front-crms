import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  users: 'users?perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
