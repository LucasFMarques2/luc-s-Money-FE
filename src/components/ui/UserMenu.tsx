import { useState, useEffect } from 'react'
import { LogOut, UserCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from './avatar'
import { toast } from 'sonner'

export const UserMenu = () => {
  const { user, signOut } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string>('')

  useEffect(() => {
    const savedAvatar = localStorage.getItem('@finance:avatar')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedAvatar) setAvatarUrl(savedAvatar)
  }, [])

  const handleUpdateAvatar = () => {
    const url = window.prompt(
      'Insira a URL da imagem para o avatar:',
      avatarUrl
    )

    if (url !== null) {
      localStorage.setItem('@finance:avatar', url)
      setAvatarUrl(url)
      toast.success('Avatar atualizado!')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='outline-none'>
          <Avatar className='h-9 w-9 border border-zinc-800 hover:opacity-80 transition'>
            <AvatarImage src={avatarUrl} alt={user?.name} />
            <AvatarFallback className='bg-zinc-900 text-zinc-400'>
              {user?.name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='w-56 bg-zinc-950 border-zinc-800 text-zinc-100'
        align='end'
      >
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>{user?.name}</p>
            <p className='text-xs leading-none text-zinc-400'>{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='bg-zinc-800' />

        <DropdownMenuItem
          onClick={handleUpdateAvatar}
          className='cursor-pointer focus:bg-zinc-900'
        >
          <UserCircle className='mr-2 h-4 w-4' />
          <span>Alterar Avatar</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={signOut}
          className='cursor-pointer focus:bg-zinc-900 text-rose-500 focus:text-rose-400'
        >
          <LogOut className='mr-2 h-4 w-4' />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
