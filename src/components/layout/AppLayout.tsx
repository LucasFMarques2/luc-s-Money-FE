import { FiDollarSign, FiHome, FiMenu, FiPieChart } from 'react-icons/fi'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'

import { UserMenu } from '../ui/UserMenu'
import { NotificationBell } from '../ui/NotificationBell'

const sidebarItems = [
  { icon: FiHome, label: 'Dashboard', href: '/' },
  { icon: FiDollarSign, label: 'Transações', href: '/transactions' },
  { icon: FiPieChart, label: 'Relatórios', href: '/reports' },
]

const SidebarContent = () => {
  const location = useLocation()

  return (
    <div className='flex flex-col h-full bg-sidebar border-r border-sidebar-border'>
      <div className='p-6 flex items-center gap-2 border-b border-sidebar-border'>
        <div className='h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center'>
          <FiDollarSign className='text-white font-bold' />
        </div>
        <span className='text-xl font-bold text-sidebar-foreground tracking-tight'>
          Luc's Money
        </span>
      </div>

      <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
        {sidebarItems.map(item => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-sidebar-accent text-emerald-400 border border-sidebar-border'
                  : 'text-zinc-400 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon className='h-5 w-5' />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export const AppLayout = () => {
  return (
    <div className='flex min-h-screen bg-background font-sans selection:bg-emerald-500/30'>
      <aside className='hidden md:block w-64 h-screen sticky top-0'>
        <SidebarContent />
      </aside>

      <main className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        <header className='h-16 border-b border-border flex items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-xl sticky top-0 z-10'>
          <div className='md:hidden'>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground'
                >
                  <FiMenu className='h-6 w-6' />
                </Button>
              </SheetTrigger>
              <SheetContent
                side='left'
                className='p-0 w-64 border-sidebar-border bg-sidebar'
              >
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>

          <h2 className='text-lg font-semibold text-foreground hidden md:block'>
            Visão Geral
          </h2>
          <div className='flex items-center gap-2 ml-auto'>
            <NotificationBell />
            <div className='h-6 w-px bg-border mx-2 hidden sm:block' />


            <UserMenu />
          </div>
        </header>
        <div className='flex-1 overflow-auto p-4 md:p-8 bg-background text-foreground'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
