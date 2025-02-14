import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  entities: 'entities?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  tools:
    'tools?perPage=-1&is_group_similar=1&entity_name=gpts&block_name=Profile&isShort=1&isCommon=1',
  task_templates: 'task-templates?perPage=-1&isShort=1&isCommon=1&is_group=1',
  links: 'links?perPage=-1&isShort=1&isCommon=1',
  users: 'users?perPage=-1&isShort=1&isCommon=1',
  accounts: 'accounts?perPage=-1&isCommon=1&isShort=1',
  types: 'gpt-types?perPage=-1&isCommon=1&isShort=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
