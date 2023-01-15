import { useEffect, useCallback } from "react";

import { useAuth } from "../hook/auth"

import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";

import { Can } from "../components/Can";

import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user, signOut, broadcastAuth } = useAuth()

  const handleSignOut = useCallback(() => {
    broadcastAuth.current.postMessage("signOut");
    signOut();
  }, [broadcastAuth, signOut])

  useEffect(() => {
    api.get('/me').then(response => {
      console.log(response.data)
    }).catch((err) => console.log(err));
  }, [])

  return (
    <>
      <h1>Dashboard {user?.email}</h1>

      <button onClick={handleSignOut}>Sign Out</button>

      <Can permissions={['metrics.list']}>
        <div>Métricas</div>
      </Can>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (context) => {
  const apiClient = setupAPIClient(context);
  const response = await apiClient.get('/me');

  console.log(response.data)

  return {
    props: {}
  }
});