export interface IPermissionType {
  id: number;
  name: string;
}

interface IPermission {
  id: number;
  permission_role_id: number;
  name: string;
  display_name: string;
  description: string | null;
  is_custom: number;
  permission_type: IPermissionType;
  allowed_permissions: Array<IPermissionType>;
}

export interface IExpandedEntity extends IEntity {
  permissions: Array<IPermission>;
  permissions_custom: Array<IPermission>;
}

export interface IPermissionEntityType extends IEntityType {
  entities: IExpandedEntity[];
}

export interface IRolePermission {
  id: number;
  name: string;
  description: string;
  display_name: string;
  employees: number[];
  position: { position_id: number; name: string };
  profession: { profession_id: number; name: string };
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
  entity_types: Array<IPermissionEntityType>;
}
