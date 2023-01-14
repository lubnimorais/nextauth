import { useEffect } from "react";
import { useAuth } from "../hook/auth"
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";

import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user } = useAuth()

  useEffect(() => {
    api.get('/me').then(response => {
      console.log(response.data)
    }).catch((err) => console.log(err));
  }, [])

  return (
    <h1>Dashboard {user?.email}</h1>
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

export { Dashboard }