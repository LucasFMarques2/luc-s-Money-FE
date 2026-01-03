import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { toast } from 'sonner'
import { FiDollarSign } from 'react-icons/fi'

export const RegisterView = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signUp({ name, email, password })
      navigate('/')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Erro ao criar conta.')
    }
  }

  return (
    <div className='min-h-screen bg-zinc-950 flex items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-xl border border-zinc-800'>
        <div className='flex flex-col items-center'>
          <div className='h-12 w-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4'>
            <FiDollarSign className='text-white text-2xl font-bold' />
          </div>
          <h2 className='text-2xl font-bold text-white'>Crie sua conta</h2>
          <p className='text-zinc-400 mt-2'>Comece a controlar suas finanças</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-zinc-300'>Nome</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className='bg-zinc-950 border-zinc-800'
              required
            />
          </div>
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
            Cadastrar
          </Button>
        </form>

        <div className='text-center text-sm text-zinc-400'>
          Já tem uma conta?{' '}
          <Link to='/login' className='text-emerald-500 hover:underline'>
            Faça login
          </Link>
        </div>
      </div>
    </div>
  )
}
