import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  professions: 'professions?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  inner_clients: 'inner-clients?perPage=-1&isShort=1&isCommon=1',
  task_templates: 'task-templates?perPage=-1&isShort=1&isCommon=1&is_group=1',
  actions: 'actions?perPage=-1&isShort=1&isCommon=1',
  objects: 'objects?perPage=-1&isShort=1&isCommon=1',
  managers: 'users?perPage=-1&isShort=1&isCommon=1',
  rates: 'rates?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  shifts: 'shifts?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  job_templates: 'job-templates?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  tools: 'tools?perPage=-1&isShort=1&isCommon=1',
  departments: 'departments?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  languages: 'languages?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  levels: 'levels?perPage=-1&isShort=1&isCommon=1',
  statuses:
    'statuses?entity_name=job_requests&block_name=Profile&is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
