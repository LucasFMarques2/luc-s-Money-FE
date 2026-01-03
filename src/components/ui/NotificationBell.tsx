import { Bell } from 'lucide-react'
import { useTransactions } from '../../context/TransactionsContext'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { ScrollArea } from './scroll-area'

export const NotificationBell = () => {
  const { transactions } = useTransactions()

  const pendingNotifications = transactions.filter(t => {
    if (t.type.toLowerCase() !== 'expense' || t.payment_date) return false

    const dueDate = new Date(t.due_date)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    return (
      dueDate.getUTCDate() === tomorrow.getUTCDate() &&
      dueDate.getUTCMonth() === tomorrow.getUTCMonth() &&
      dueDate.getUTCFullYear() === tomorrow.getUTCFullYear()
    )
  })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className='relative p-2 text-muted-foreground hover:text-foreground transition outline-none'>
          <Bell className='h-5 w-5' />
          {pendingNotifications.length > 0 && (
            <span className='absolute top-2 right-2 flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-rose-500'></span>
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className='w-80 bg-background border-border p-0 shadow-2xl'
        align='end'
      >
        <div className='p-4 border-b border-border'>
          <h4 className='text-sm font-semibold'>Vencem amanhã</h4>
        </div>
        <ScrollArea
          className={pendingNotifications.length > 0 ? 'h-72' : 'h-auto'}
        >
          {pendingNotifications.length === 0 ? (
            <div className='p-8 text-center text-muted-foreground text-xs italic'>
              Nenhuma conta vencendo amanhã! 🎉
            </div>
          ) : (
            <div className='flex flex-col'>
              {pendingNotifications.map(t => (
                <div
                  key={t.id}
                  className='p-4 border-b border-muted hover:bg-muted/50 transition'
                >
                  <p className='text-sm font-medium text-foreground'>
                    {t.description}
                  </p>
                  <p className='text-xs text-rose-500 font-mono mt-1'>
                    R${' '}
                    {Number(t.amount).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
