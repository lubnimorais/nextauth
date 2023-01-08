import { useEffect } from "react";
import { useAuth } from "../hook/auth"
import { api } from "../services/api";

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

export { Dashboard }