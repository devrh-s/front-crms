import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  countries: 'countries?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  languages: 'languages?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  currencies: 'currencies?perPage=-1&isShort=1&isCommon=1',
  pricings: 'pricing-types?perPage=-1&isShort=1&isCommon=1',
  users: 'users?perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
