import { useState } from 'react'
import { FiDollarSign } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { useAuth } from '../../../context/AuthContext'

export const LoginView = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn({ email, password })
      navigate('/')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Erro ao fazer login. Verifique suas credenciais.')
    }
  }

  return (
    <div className='min-h-screen bg-zinc-950 flex items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-xl border border-zinc-800'>
        <div className='flex flex-col items-center'>
          <div className='h-12 w-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4'>
            <FiDollarSign className='text-white text-2xl font-bold' />
          </div>
          <h2 className='text-2xl font-bold text-white'>Acesse sua conta</h2>
          <p className='text-zinc-400 mt-2'>
            Bem-vindo de volta ao Luc's Money
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-zinc-300'>Email</label>
            <Input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='bg-zinc-950 border-zinc-800'
              required
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-zinc-300'>Senha</label>
            <Input
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='bg-zinc-950 border-zinc-800'
              required
            />
          </div>

          <Button
            type='submit'
            className='w-full bg-emerald-600 hover:bg-emerald-700'
          >
            Entrar
          </Button>
        </form>

        <div className='text-center text-sm text-zinc-400'>
          Não tem uma conta?{' '}
          <Link to='/register' className='text-emerald-500 hover:underline'>
            Crie agora
          </Link>
        </div>
      </div>
    </div>
  )
}
