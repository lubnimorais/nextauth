import { useState, useCallback, FormEvent } from "react"

import { useAuth } from "../hook/auth";

import styles from './home.module.css'

export default function Home() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(async (event: FormEvent) => {
    event.preventDefault();

    await signIn({ email, password })
  },[email, password, signIn])


  return (
    <div className={styles.container}>
      <form className={styles.boxForm} onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={event => { setEmail(event.target.value) }} />
        <input type="password" value={password} onChange={event => { setPassword(event.target.value) }} />

        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}
