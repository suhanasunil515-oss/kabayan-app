/**
 * Admin role definitions and permissions
 * SUPERIOR_ADMIN: Full access including Administrator Management
 * VIP_ADMIN: All operations except Administrator Management
 * REGULAR_ADMIN: User Management > Details only, Loan Management > Checking only
 */

export type AdminRole = 'SUPERIOR_ADMIN' | 'VIP_ADMIN' | 'REGULAR_ADMIN';

export function canAccessAdministratorManagement(role: string | null | undefined): boolean {
  return role === 'SUPERIOR_ADMIN' || role === 'SUPER_ADMIN';
}

export function canAccessUserManagement(role: string | null | undefined): boolean {
  return !!role; // All admins can access user list
}

/** Regular admin can ONLY use Details (view), not other user actions */
export function canUseUserAction(role: string | null | undefined, action: string): boolean {
  if (!role) return false;
  if (role === 'REGULAR_ADMIN' || role === 'MODERATOR') {
    return action === 'details'; // Only Details for regular
  }
  return true; // Superior and VIP can do all
}

/** Regular admin can ONLY use Checking, not Review/Modify/Contract/Delete */
export function canUseLoanOperation(role: string | null | undefined, operation: string): boolean {
  if (!role) return false;
  if (role === 'REGULAR_ADMIN' || role === 'MODERATOR') {
    return operation === 'checking';
  }
  return true;
}

export function canAccessFundManagement(role: string | null | undefined): boolean {
  return ['SUPERIOR_ADMIN', 'VIP_ADMIN', 'SUPER_ADMIN', 'ADMIN'].includes(role || '');
}

export function canAccessDocumentManagement(role: string | null | undefined): boolean {
  return ['SUPERIOR_ADMIN', 'VIP_ADMIN', 'SUPER_ADMIN', 'ADMIN'].includes(role || '');
}

export function canAccessDashboard(role: string | null | undefined): boolean {
  return !!role; // All admins
}

export const ROLE_LABELS: Record<string, string> = {
  SUPERIOR_ADMIN: 'Superior Admin',
  SUPER_ADMIN: 'Superior Admin',
  VIP_ADMIN: 'VIP Admin',
  REGULAR_ADMIN: 'Regular Admin',
  ADMIN: 'Admin',
  MODERATOR: 'Regular Admin',
};
