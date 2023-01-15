import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";

import { validateUserPermissions } from "./validateUserPermissions";

import decode from 'jwt-decode';

import { AuthTokenError } from "../services/errors/AuthTokenError";

type IWithSSRAuthOptions = {
  permissions?: Array<string>;
  roles?: Array<string>;
}

function withSSRAuth<P extends { [key: string]: any; }>(fn: GetServerSideProps<P>,
  options?: IWithSSRAuthOptions) {

  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(context);

    const token = cookies['nextauth.token'];

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }

    if (options) {
      const user = decode<{ permissions: Array<string>, roles: Array<string> }>(token);
      const { permissions, roles } = options;

      const userHaveValidPermissions = validateUserPermissions({ user, permissions, roles });

      if (!userHaveValidPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false,
          }
        }
      }
    }

    try {
      return await fn(context)
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(context, 'nextauth.token');
        destroyCookie(context, 'nextauth.refreshToken');

        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      }

      return {
        redirect: {
          destination: '/error',
          permanent: false
        }
      }
    }
  }
}

export { withSSRAuth }