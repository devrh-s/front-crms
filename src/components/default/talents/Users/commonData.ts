import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  currencies: 'currencies?is_group_similar=1&isShort=1&isCommon=1',
  roles: 'role-permissions?isCommon=1&isShort=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
