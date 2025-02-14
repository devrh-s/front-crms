import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  statuses: 'statuses?perPage=-1&entity_name=professions&block_name=Profile&isCommon=1&isShort=1',
  languages: 'languages?is_group=1&perPage=-1&isCommon=1&isShort=1',
  priorities: 'priorities?perPage=-1&isCommon=1&isShort=1',
  groups: 'professions?is_group=1&perPage=-1&isCommon=1&isShort=1',
  groups_similar: 'professions?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  departments: 'departments?is_group=1&perPage=-1&isCommon=1&isShort=1',
  tools:
    'tools?is_group=1&perPage=-1&entity_name=professions&block_name=Profile&isCommon=1&isShort=1',
  task_templates: 'task-templates?is_group=1&perPage=-1&isCommon=1&isShort=1&is_group=1',
  users: 'users?perPage=-1&isCommon=1&isShort=1',
  currencies: 'currencies?perPage=-1&isShort=1&isCommon=1',
  rates: 'rates?is_group=1&perPage=-1&isShort=1&isCommon=1',
  links: 'links?is_group=1&perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
