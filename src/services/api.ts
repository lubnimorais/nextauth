import axios, { AxiosError } from 'axios';
import { destroyCookie, parseCookies, setCookie } from 'nookies';

import { signOut } from '../hook/auth';
import { AuthTokenError } from './errors/AuthTokenError';


let isRefreshing = false; // identifica se está sendo atualizado o token ou não
let failedRequestQueue = [] // são todas as requisições que falharam por causa do token expirado

interface AxiosErrorResponse {
  code?: string;
}

function setupAPIClient(context = undefined) {  
  let cookies = parseCookies(context);

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`
    }
  });
  
  api.interceptors.response.use(response => {
    return response;
  }, (error: AxiosError<AxiosErrorResponse>) => {
    if (error.response) {
      if (error.response.status === 401) {
        if (error.response.data?.code === 'token.expired') {
          cookies = parseCookies(context);
  
          const { 'nextauth.refreshToken': refreshToken } = cookies;
  
          /** NOTE
           * O config é basicamente toda configuração da requisição
           * que foi feita para o back-end
           * Dentro dele vai ter todas as informações que é necessária
           * para repetir uma requisição para o back-end
          */
          const originalConfig = error.config;
  
          if (!isRefreshing) {
            isRefreshing = true;
  
            api.post('/refresh', {
              refreshToken
            }).then(response => {
              const { token, refreshToken: refresh_token } = response.data;
  
              setCookie(context, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
              });
  
              // NOTE - maxAge: quanto tempo queremos armazenar, manter salvo no navegador 
              setCookie(context, 'nextauth.refreshToken', refresh_token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
              });
  
              api.defaults.headers['Authorization'] = `Bearer ${token}`;
  
              failedRequestQueue.forEach(request => request.onSuccess(token))
              failedRequestQueue = [];
            }).catch(err => {
              failedRequestQueue.forEach(request => request.onFailed(err))
              failedRequestQueue = [];
  
              if (typeof window !== 'undefined') {
                signOut();
              }
              signOut();
            }).finally(() => {
              isRefreshing = false
            });
          }
  
          return new Promise((resolve, reject) => {
            /** NOTE 
             * Vai ter duas propriedades
             * 
             * - onSuccess: que vai acontece quando o token tiver finalizado de ser
             * atualizado, o processo de refresh tiver finalizado
             * 
             * - onFailed: o que acontece no caso o processo de refresh token tenha dado errado
             */
            failedRequestQueue.push({
              onSuccess: (token: string) => {
                if (originalConfig) {
                  originalConfig.headers['Authorization'] = `Bearer ${token}`;
  
                  resolve(api(originalConfig))
                }
              },
              onFailed: (err: AxiosError) => {
                reject(err)
              }
            })
          })
        } else {
          if (typeof window !== 'undefined') {
            signOut();
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }    
    }
  
    return Promise.reject(error);
  });

  return api;
}

export { setupAPIClient }