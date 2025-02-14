import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  countries: 'countries?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  cv_types: 'cv-types?perPage=-1&isCommon=1&isShort=1',
  professions: 'professions?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  industries: 'industries?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  sub_industries: 'sub-industries?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
