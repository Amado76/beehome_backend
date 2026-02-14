export type FamilyRole =
  | 'VIEW_ONLY'
  | 'CREATE_EDIT'
  | 'MANAGE_SETTINGS_GOALS'
  | 'ADMIN';

export type LicenseReason = 'TRIAL' | 'ACTIVE' | 'OVERRIDE' | 'EXPIRED' | 'UNKNOWN';

export type AuthContext = {
  userId: string;
};

export type LicenseContext = {
  isLicensed: boolean;
  reason: LicenseReason;
};

export type RequestContext = {
  auth?: AuthContext;
  familyId?: string;
  role?: FamilyRole;
  license?: LicenseContext;
};

const roleRank: Record<FamilyRole, number> = {
  VIEW_ONLY: 1,
  CREATE_EDIT: 2,
  MANAGE_SETTINGS_GOALS: 3,
  ADMIN: 4,
};

export function isRoleAtLeast(params: {
  role: FamilyRole;
  required: FamilyRole;
}): boolean {
  return roleRank[params.role] >= roleRank[params.required];
}
