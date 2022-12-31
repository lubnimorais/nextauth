import { createContext, useCallback, useContext, ReactNode } from "react";

type ICredencial =  {
  email: string;
  password: string;
}

type IAuthContextData = {
  signIn({email, password}: ICredencial): Promise<void>;
  isAuthenticated: boolean;
}

interface IAuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext({} as IAuthContextData);

const AuthProvider = ({children}: IAuthProviderProps) => {
  const isAuthenticated = false;

  const signIn = useCallback(async ({email, password}: ICredencial) => {
    console.log({ email, password });
  }, [])

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated }}>
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

export { AuthProvider, useAuth };