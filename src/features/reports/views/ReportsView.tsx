import { useState, useEffect } from 'react'
import { Trash2, Circle, CheckCircle2, Plus, Edit2 } from 'lucide-react'
import {
  useTransactions,
  CATEGORY_IDS,
  type BudgetGroup,
} from '../../../context/TransactionsContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../../../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Label } from '../../../components/ui/label'
import { toast } from 'sonner'
import { CurrencyInput } from '../../../components/ui/currency-input'
import { formatDateToAPI, getCurrentMonthLabel } from '../../../lib/utils'

// --- DIALOG SALÁRIO ---
const AddSalaryDialog = ({
  group,
  currentValue,
}: {
  group: BudgetGroup
  currentValue: number
}) => {
  const [open, setOpen] = useState(false)
  const { upsertSalary } = useTransactions()
  const [amount, setAmount] = useState(currentValue)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setAmount(currentValue)
  }, [open, currentValue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await upsertSalary(group, amount)
      toast.success('Entrada atualizada!')
      setOpen(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Erro ao atualizar entrada')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6 text-emerald-500'
        >
          <Edit2 className='h-3.5 w-3.5' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-100 bg-zinc-950 border-zinc-800 text-zinc-100'>
        <DialogHeader>
          <DialogTitle>Definir Entrada</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Valor da Entrada (R$)</Label>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              className='bg-zinc-900 border-zinc-800 text-lg font-bold text-emerald-500'
              placeholder='R$ 0,00'
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type='submit'
              className='bg-emerald-600 hover:bg-emerald-700 w-full'
            >
              Salvar Entrada
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// --- DIALOG GASTO ---
const AddReportExpenseDialog = ({
  defaultDay,
}: {
  group: BudgetGroup
  defaultDay: number
}) => {
  const [open, setOpen] = useState(false)
  const { createTransaction } = useTransactions()

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [day, setDay] = useState(defaultDay.toString())
  const [installments, setInstallments] = useState('1')
  const [categoryName, setCategoryName] = useState('Contas Básicas')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const now = new Date()
      // Garante a data correta para o mês atual
      const dueDate = new Date(now.getFullYear(), now.getMonth(), Number(day))
      const formattedDate = formatDateToAPI(dueDate) // YYYY-MM-DD

      await createTransaction({
        categoryId: CATEGORY_IDS[categoryName],
        description,
        amount,
        dueDate: formattedDate, // O Contexto adicionará T12:00:00
        installments: Number(installments) || 1,
        isPaid: false,
      })

      toast.success('Gasto adicionado!')
      setOpen(false)
      setDescription('')
      setAmount(0)
      setInstallments('1')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Erro ao adicionar gasto')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 w-8 p-0 hover:bg-zinc-800'
        >
          <Plus className='h-4 w-4 text-zinc-400' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-106.25 bg-zinc-950 border-zinc-800 text-zinc-100'>
        <DialogHeader>
          <DialogTitle>Adicionar Gasto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Descrição</Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              className='bg-zinc-900 border-zinc-800'
              placeholder='Ex: Luz'
              required
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label>Valor (Parcela)</Label>
              <CurrencyInput
                value={amount}
                onChange={setAmount}
                className='bg-zinc-900 border-zinc-800 text-left'
                placeholder='R$ 0,00'
              />
            </div>
            <div className='grid gap-2'>
              <Label>Dia Venc.</Label>
              <Input
                type='number'
                value={day}
                onChange={e => setDay(e.target.value)}
                className='bg-zinc-900 border-zinc-800'
                required
              />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label>Categoria</Label>
              <Select value={categoryName} onValueChange={setCategoryName}>
                <SelectTrigger className='bg-zinc-900 border-zinc-800'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='bg-zinc-900 border-zinc-800 text-zinc-100'>
                  {Object.keys(CATEGORY_IDS)
                    .filter(
                      c => !['Salário', 'Extra', 'Investimento'].includes(c)
                    )
                    .map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid gap-2'>
              <Label>Parcelas</Label>
              <Input
                type='number'
                min='1'
                value={installments}
                onChange={e => setInstallments(e.target.value)}
                className='bg-zinc-900 border-zinc-800'
                placeholder='1'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='submit'
              className='bg-emerald-600 hover:bg-emerald-700 w-full'
            >
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// --- CARD DE ORÇAMENTO ---
const BudgetCard = ({
  title,
  group,
  dayStart,
  dayEnd,
}: {
  title: string
  group: BudgetGroup
  dayStart: number
  dayEnd: number
}) => {
  const {
    transactions,
    deleteTransaction,
    toggleTransactionStatus,
    getSalaryForGroup,
  } = useTransactions()

  const actualIncome = getSalaryForGroup(group)

  const items = transactions.filter(t => {
    // Leitura manual da data para evitar timezone (YYYY-MM-DD)
    const [yearStr, monthStr, dayStr] = t.due_date.split('T')[0].split('-')
    const day = Number(dayStr)
    const month = Number(monthStr) - 1
    const year = Number(yearStr)

    const now = new Date()
    // Filtra EXATAMENTE pelo mês atual
    const isCurrentMonth =
      month === now.getMonth() && year === now.getFullYear()

    const isSalary = ['Salário 01', 'Salário 15', 'Extra 20'].includes(
      t.description
    )

    return (
      t.type?.toUpperCase() === 'EXPENSE' &&
      !isSalary &&
      isCurrentMonth &&
      day >= dayStart &&
      day <= dayEnd
    )
  })

  const totalExpenses = items.reduce(
    (acc, item) => acc + Number(item.amount),
    0
  )
  const leftOver = actualIncome - totalExpenses

  return (
    <Card className='bg-zinc-950 border-zinc-800'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base font-medium text-zinc-200'>
            {title}
          </CardTitle>
          <AddReportExpenseDialog group={group} defaultDay={dayStart} />
        </div>

        <div className='flex items-center justify-between mt-2 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800'>
          <span className='text-xs text-zinc-400 uppercase tracking-wider font-semibold'>
            Entrada
          </span>
          <div className='flex items-center gap-2'>
            <span className='text-emerald-500 font-bold text-sm'>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(actualIncome)}
            </span>
            <AddSalaryDialog group={group} currentValue={actualIncome} />
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='space-y-1 min-h-25'>
          {items.length === 0 ? (
            <div className='text-center py-8 text-xs text-zinc-600 italic'>
              Nenhuma conta para este período.
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className={`group flex items-center justify-between p-2 rounded-md hover:bg-zinc-900/50 transition-colors ${
                  item.payment_date ? 'opacity-50' : ''
                }`}
              >
                <div
                  className='flex items-center gap-3 overflow-hidden cursor-pointer flex-1'
                  onClick={() => toggleTransactionStatus(item)}
                >
                  {item.payment_date ? (
                    <CheckCircle2 className='w-4 h-4 text-emerald-600 shrink-0' />
                  ) : (
                    <Circle className='w-4 h-4 text-zinc-600 hover:text-emerald-500 transition-colors shrink-0' />
                  )}
                  <div className='flex flex-col min-w-0'>
                    <span
                      className={`text-sm truncate font-medium ${
                        item.payment_date
                          ? 'line-through text-zinc-500'
                          : 'text-zinc-300'
                      }`}
                    >
                      {item.description}
                      {item.installment_total && item.installment_total > 1 && (
                        <span className='ml-1 text-[10px] text-zinc-500 bg-zinc-800 px-1 rounded'>
                          {item.installment_current}/{item.installment_total}
                        </span>
                      )}
                    </span>
                    <span className='text-[10px] text-zinc-500'>
                      Dia {new Date(item.due_date).getUTCDate()} •{' '}
                      {item.category_name}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-2 pl-2'>
                  <span className='text-sm font-medium text-zinc-300 whitespace-nowrap'>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(item.amount)}
                  </span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-500 hover:bg-transparent'
                    onClick={() => deleteTransaction(item.id)}
                  >
                    <Trash2 className='w-3 h-3' />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className='pt-4 border-t border-zinc-800 space-y-2'>
          <div className='flex justify-between text-sm text-zinc-500'>
            <span>Total Contas</span>
            <span>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(totalExpenses)}
            </span>
          </div>
          <div className='flex justify-between items-center bg-zinc-900 p-3 rounded-lg border border-zinc-800'>
            <span className='font-medium text-zinc-200'>Sobra</span>
            <span
              className={`font-bold ${
                leftOver >= 0 ? 'text-emerald-400' : 'text-rose-500'
              }`}
            >
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(leftOver)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const ReportsView = () => {
  return (
    <div className='space-y-6 animate-in fade-in duration-500 pb-10'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight text-foreground'>
          Planejamento Mensal
        </h1>
        <p className='text-emerald-500 font-semibold mt-1'>
          {getCurrentMonthLabel()}
        </p>
      </div>
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start'>
        <BudgetCard
          title='1º Dia Útil (Salário)'
          group='start_month'
          dayStart={1}
          dayEnd={14}
        />
        <BudgetCard
          title='Dia 15 (Salário)'
          group='mid_month'
          dayStart={15}
          dayEnd={19}
        />
        <BudgetCard
          title='Dia 20 (Extras)'
          group='end_month'
          dayStart={20}
          dayEnd={31}
        />
      </div>
    </div>
  )
}
