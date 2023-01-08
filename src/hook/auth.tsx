import { createContext, useCallback, useContext, ReactNode, useState, useEffect } from "react";
import Router from "next/router";

import { setCookie, parseCookies, destroyCookie } from 'nookies';

import { api } from "../services/api";

type IUser = {
  email: string;
  permissions: Array<string>;
  roles: Array<string>;
}

type ICredencial = {
  email: string;
  password: string;
}

type IAuthContextData = {
  signIn({ email, password }: ICredencial): Promise<void>;
  user: IUser | undefined;
  isAuthenticated: boolean;
}

interface IAuthProviderProps {
  children: ReactNode;
}


function signOut() {
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refreshToken');

  Router.push('/');
}

const AuthContext = createContext({} as IAuthContextData);

const AuthProvider = ({ children }: IAuthProviderProps) => {

  const [user, setUser] = useState<IUser>();

  const isAuthenticated = !!user;

  const signIn = useCallback(async ({ email, password }: ICredencial) => {
    try {
      const response = await api.post('/sessions', {
        email,
        password
      })

      const { token, refreshToken, permissions, roles } = response.data;

      // NOTE - maxAge: quanto tempo queremos armazenar, manter salvo no navegador
      /** NOTE
         path: diz quais caminhos da aplicação vai ter acesso ao cookie.
         E quando colocamos / falamos que qualquer endereço da aplicação vai ter acesso
         ao cookie. Fazemos isso quando é um cookie que vai ser usado de forma global
      */

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });

      // NOTE - maxAge: quanto tempo queremos armazenar, manter salvo no navegador 
      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });

      setUser({
        email,
        permissions,
        roles
      })

      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      Router.push('/dashboard')
    } catch (err) {
      console.log(err);
    }
  }, [])

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();

    if (token) {
      api.get('/me').then(response => {
        const { email, permissions, roles } = response.data

        setUser({
          email,
          permissions,
          roles
        })
      }).catch(() => {
        signOut();
      })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    alert('useAuth must be use whiting an AuthProvider')
  }

  return context;
}

export { AuthProvider, useAuth, signOut };