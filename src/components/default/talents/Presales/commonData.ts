import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks: CommonDataBlocks = {
  countries: 'countries?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  cities: 'cities?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  users: 'users?&perPage=-1&is_talent=1&isShort=1&isCommon=1',
  languages: 'languages?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  priorities: 'priorities?perPage=-1&isShort=1&isCommon=1',
  statuses: 'statuses?perPage=-1&entity_name=Presales&block_name=Profile&isShort=1&isCommon=1',
  objects: 'objects?perPage=-1&isShort=1&isCommon=1',
  tools: 'tools?perPage=-1&entity_name=Presales&block_name=Contacts&isShort=1&isCommon=1',
  tools_candidates: 'tools?perPage=-1&entity_name=Presales&block_name=Profile&isShort=1&isCommon=1',
  task_templates: 'task-templates?perPage=-1&isShort=1&isCommon=1',
  departments: 'departments?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  professions: 'professions?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  rates: 'rates?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  shifts: 'shifts?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  inner_clients: 'inner-clients?perPage=-1&isShort=1&isCommon=1',
  levels: 'levels?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  cv_types: 'cv-types?perPage=-1&isShort=1&isCommon=1',
  industries: 'industries?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  sub_industries: 'sub-industries?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  content_types: 'content-types?perPage=-1&isShort=1&isCommon=1',
  currencies: 'currencies?perPage=-1&isShort=1&isCommon=1',
  links: 'links?is_group=1&perPage=-1&isShort=1&isCommon=1',
  salary_types: 'salary-types?is_group=1&perPage=-1&isShort=1&isCommon=1',
  messages: 'messages?perPage=-1&isShort=1&isCommon=1',
  accounts: 'accounts?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  communication_types: 'communication-types?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  comment_types: 'comment-types?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  positions: 'positions?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
