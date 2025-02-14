import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  professions: {
    url: 'professions?is_group=1&perPage=-1&isShort=1&isCommon=1',
    isFull: true,
  },
  similar_professions: {
    url: 'professions?is_similar=1&perPage=-1&isCommon=1&isShort=1',
    isFull: true,
  },
  departments: 'departments?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  languages: 'languages?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  users: 'users?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  tools:
    'tools?entity_name=job_templates&block_name=Profile&is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  task_templates: 'task-templates?is_group_similar=1&perPage=-1&isShort=1&isCommon=1&is_group=1',
  objects: 'objects?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  statuses: 'statuses?entity_name=job_templates&block_name=Profile&perPage=-1&isShort=1&isCommon=1',
  job_requests: 'job-requests?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
