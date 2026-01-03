import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  useTransactions,
  type BudgetGroup,
} from '../../../context/TransactionsContext'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../../../components/ui/dialog'
import { Label } from '../../../components/ui/label'
import { toast } from 'sonner'

interface AddExpenseDialogProps {
  group: BudgetGroup
  groupName: string
}

export const AddExpenseDialog = ({
  group,
  groupName,
}: AddExpenseDialogProps) => {
  const [open, setOpen] = useState(false)
  const { addFixedExpense } = useTransactions()

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [day, setDay] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addFixedExpense({
        group,
        name,
        amount: Number(amount),
        day: Number(day) || 1,
      })
      toast.success('Gasto adicionado com sucesso!')
      setName('')
      setAmount('')
      setDay('')
      setOpen(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Erro ao adicionar gasto')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <Plus className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-106.25 bg-zinc-950 border-zinc-800 text-zinc-100'>
        <DialogHeader>
          <DialogTitle>Adicionar Gasto - {groupName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Nome da Conta</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className='bg-zinc-900 border-zinc-800'
              placeholder='Ex: Luz'
              required
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label>Valor (R$)</Label>
              <Input
                type='number'
                step='0.01'
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className='bg-zinc-900 border-zinc-800'
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label>Dia Venc.</Label>
              <Input
                type='number'
                value={day}
                onChange={e => setDay(e.target.value)}
                className='bg-zinc-900 border-zinc-800'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='submit'
              className='bg-emerald-600 hover:bg-emerald-700'
            >
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
