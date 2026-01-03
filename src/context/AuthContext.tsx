import { createContext, useContext, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import {
  type LoginDTO,
  type RegisterDTO,
} from '../features/auth/schema/authSchema'

interface User {
  id: number
  name: string
  email: string
}

interface AuthContextType {
  signed: boolean
  user: User | null
  signIn: (data: LoginDTO) => Promise<void>
  signUp: (data: RegisterDTO) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storagedUser = localStorage.getItem('user')
    const storagedToken = localStorage.getItem('token')

    if (storagedUser && storagedToken) {
      return JSON.parse(storagedUser)
    }
    return null
  })

  async function signIn(data: LoginDTO) {
    const response = await api.post('/auth/login', data)

    const { user, token } = response.data

    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)

    setUser(user)
  }

  async function signUp(data: RegisterDTO) {
    await api.post('/users', data)
    await signIn({ email: data.email, password: data.password })
  }

  function signOut() {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ signed: !!user, user, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
