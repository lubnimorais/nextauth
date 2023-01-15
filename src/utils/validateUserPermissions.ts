type User = {
  permissions: Array<string>;
  roles: Array<string>;
}

type IValidateUserPermissionsParams = {
  user: User
  permissions?: Array<string>
  roles?: Array<string>;
}

function validateUserPermissions({ 
  user, 
  permissions, 
  roles
}: IValidateUserPermissionsParams) {

  if (permissions) {
    if (permissions.length > 0) {
      const hashAllPermissions = permissions.every(permission => {
        return user?.permissions.includes(permission);
      });

      if (!hashAllPermissions) {
        return false;
      }
    }
  }

  if (roles) {
    if (roles.length > 0) {
      const hashAllRoles = roles.some(role => {
        return user?.roles.includes(role);
      });

      if (!hashAllRoles) {
        return false;
      }
    }
  }

  return true;
}

export { validateUserPermissions }