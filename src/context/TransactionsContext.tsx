import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { api } from '../lib/api'
import { useAuth } from './AuthContext'
import { toast } from 'sonner'
import { formatDateToAPI } from '../lib/utils'

export interface Transaction {
  id: number
  description: string
  amount: number
  type: string
  category_name: string
  due_date: string
  payment_date: string | null
  category_id: number
  installment_current?: number
  installment_total?: number
}

export interface CreateTransactionDTO {
  categoryId: number
  description: string
  amount: number
  dueDate: string
  installments?: number
  isPaid?: boolean
}

export type BudgetGroup = 'start_month' | 'mid_month' | 'end_month'

// eslint-disable-next-line react-refresh/only-export-components
export const CATEGORY_IDS: Record<string, number> = {
  Salário: 1,
  Extra: 2,
  Habitação: 3,
  'Contas Básicas': 4,
  Saúde: 5,
  Educação: 6,
  Assinaturas: 7,
  Esporte: 8,
  'Religião/Doação': 9,
  Transporte: 10,
  'Cartão de Crédito': 11,
  Empréstimos: 12,
  'Casa/Móveis': 13,
  Investimento: 14,
}

interface AddFixedExpenseData {
  group: BudgetGroup
  name: string
  amount: number
  day: number
}

interface TransactionsContextType {
  transactions: Transaction[]
  summary: {
    income: number
    expenses: number
    total: number
    investments: number
  }
  createTransaction: (data: CreateTransactionDTO) => Promise<void>
  deleteTransaction: (id: number) => Promise<void>
  toggleTransactionStatus: (transaction: Transaction) => Promise<void>
  getSalaryForGroup: (group: BudgetGroup) => number
  upsertSalary: (group: BudgetGroup, amount: number) => Promise<void>
  addFixedExpense: (data: AddFixedExpenseData) => Promise<void>
  isLoading: boolean
}

const TransactionsContext = createContext({} as TransactionsContextType)

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { signed } = useAuth()

  const fetchTransactions = useCallback(async () => {
    if (!signed) return
    try {
      setIsLoading(true)
      const response = await api.get('/transactions')
      setTransactions(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [signed])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const parseDateBr = (dateString: string) => {
    if (!dateString) return { month: -1, year: -1, day: -1 }
    const [yearStr, monthStr, dayStr] = dateString.split('T')[0].split('-')
    return {
      year: Number(yearStr),
      month: Number(monthStr) - 1,
      day: Number(dayStr),
    }
  }

  const summary = transactions.reduce(
    (acc, t) => {
      const amount = Number(t.amount)
      const isPaid = !!t.payment_date
      const type = t.type?.toUpperCase()
      if (!isPaid) return acc
      if (type === 'INCOME') {
        acc.income += amount
        acc.total += amount
      } else {
        acc.expenses += amount
        acc.total -= amount
        if (t.category_name === 'Investimento') acc.investments += amount
      }
      return acc
    },
    { income: 0, expenses: 0, total: 0, investments: 0 }
  )

  async function createTransaction(data: CreateTransactionDTO) {
    const safeDate = data.dueDate.includes('T')
      ? data.dueDate
      : `${data.dueDate}T12:00:00`
    await api.post('/transactions', { ...data, dueDate: safeDate })
    await fetchTransactions()
  }

  async function deleteTransaction(id: number) {
    await api.delete(`/transactions/${id}`)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  async function toggleTransactionStatus(t: Transaction) {
    const isNowPaid = !t.payment_date
    const now = new Date().toISOString()
    setTransactions(prev =>
      prev.map(item =>
        item.id === t.id
          ? { ...item, payment_date: isNowPaid ? now : null }
          : item
      )
    )
    try {
      await api.patch(`/transactions/${t.id}`, { isPaid: isNowPaid })
      await fetchTransactions()
      toast.success(isNowPaid ? 'Conta paga!' : 'Pagamento cancelado.')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      await fetchTransactions()
      toast.error('Erro ao atualizar status')
    }
  }

  const getSalaryIdentifier = (group: BudgetGroup) => {
    if (group === 'start_month')
      return { desc: 'Salário 01', day: 1, cat: 'Salário' }
    if (group === 'mid_month')
      return { desc: 'Salário 15', day: 15, cat: 'Salário' }
    return { desc: 'Extra 20', day: 20, cat: 'Extra' }
  }

  const getSalaryForGroup = (group: BudgetGroup) => {
    const { desc } = getSalaryIdentifier(group)
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const found = transactions.find(t => {
      const { month, year } = parseDateBr(t.due_date)
      return (
        t.description === desc &&
        month === currentMonth &&
        year === currentYear &&
        t.type?.toUpperCase() === 'INCOME'
      )
    })
    return found ? Number(found.amount) : 0
  }

  async function upsertSalary(group: BudgetGroup, amount: number) {
    const { desc, day, cat } = getSalaryIdentifier(group)
    const today = new Date()
    const targetDate = new Date(today.getFullYear(), today.getMonth(), day)
    const safeDate = `${formatDateToAPI(targetDate)}T12:00:00`
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const existing = transactions.find(t => {
      const { month, year } = parseDateBr(t.due_date)
      return (
        t.description === desc && month === currentMonth && year === currentYear
      )
    })
    if (existing) {
      await api.delete(`/transactions/${existing.id}`)
    }
    if (amount > 0) {
      await api.post('/transactions', {
        categoryId: CATEGORY_IDS[cat],
        description: desc,
        amount,
        dueDate: safeDate,
        isPaid: true,
      })
    }
    await fetchTransactions()
  }

  async function addFixedExpense({ name, amount, day }: AddFixedExpenseData) {
    const today = new Date()
    const targetDate = new Date(today.getFullYear(), today.getMonth(), day)
    const safeDate = `${formatDateToAPI(targetDate)}T12:00:00`
    await api.post('/transactions', {
      categoryId: CATEGORY_IDS['Habitação'],
      description: name,
      amount,
      dueDate: safeDate,
      isPaid: false,
    })
    await fetchTransactions()
  }

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        summary,
        createTransaction,
        deleteTransaction,
        toggleTransactionStatus,
        getSalaryForGroup,
        upsertSalary,
        addFixedExpense,
        isLoading,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTransactions() {
  return useContext(TransactionsContext)
}
