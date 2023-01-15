import { useAuth } from './auth';

import { validateUserPermissions } from '../utils/validateUserPermissions';

type IUseCanParams = {
  permissions?: Array<string>;
  roles?: Array<string>;
}

function useCan({ permissions, roles }: IUseCanParams) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return false;
  }

  let userHaveValidPermissions = false;

  if (user) {
    userHaveValidPermissions = validateUserPermissions({ user, permissions, roles });
  }

  return userHaveValidPermissions;
}



export { useCan }