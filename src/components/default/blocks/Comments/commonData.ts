import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  comment_types: 'comment-types?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  users: 'users?is_group_similar=1&perPage=-1&is_talent=1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
