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
  due_date: string // Vem do banco como "YYYY-MM-DD"
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

  // --- HELPER: Parse seguro de data do banco (YYYY-MM-DD) ---
  const parseDateBr = (dateString: string) => {
    if (!dateString) return { month: -1, year: -1, day: -1 }
    // Quebra a string "2026-01-02" em partes numéricas
    // Isso evita qualquer conversão automática de timezone do JS
    const [yearStr, monthStr, dayStr] = dateString.split('T')[0].split('-')
    return {
      year: Number(yearStr),
      month: Number(monthStr) - 1, // JS meses são 0-11
      day: Number(dayStr),
    }
  }

  // --- LÓGICA DE SALDO (DASHBOARD) ---
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
        if (t.category_name === 'Investimento') {
          acc.investments += amount
        }
      }
      return acc
    },
    { income: 0, expenses: 0, total: 0, investments: 0 }
  )

  // --- CREATE (Com ajuste de fuso horário) ---
  async function createTransaction(data: CreateTransactionDTO) {
    // Adiciona T12:00:00 para garantir que o backend salve no dia correto
    // independente do fuso horário do servidor
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

  // --- TOGGLE STATUS ---
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
      if (isNowPaid) setTimeout(() => fetchTransactions(), 500)
      else await fetchTransactions()

      toast.success(isNowPaid ? 'Conta paga!' : 'Pagamento cancelado.')
    } catch (error) {
      await fetchTransactions()
      toast.error('Erro ao atualizar status')
    }
  }

  // --- GESTÃO DE SALÁRIOS ---
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

    // Gera data local YYYY-MM-DD
    const targetDate = new Date(today.getFullYear(), today.getMonth(), day)
    const dateStr = formatDateToAPI(targetDate) // ex: "2026-01-01"
    const safeDate = `${dateStr}T12:00:00` // Blindagem contra fuso horário

    // Busca usando parse seguro
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    const existing = transactions.find(t => {
      const { month, year } = parseDateBr(t.due_date)
      return (
        t.description === desc && month === currentMonth && year === currentYear
      )
    })

    if (existing) {
      if (amount === 0) {
        await deleteTransaction(existing.id)
      } else {
        // Atualiza deletando e recriando para garantir consistência da data
        await api.delete(`/transactions/${existing.id}`)
        await api.post('/transactions', {
          categoryId: CATEGORY_IDS[cat],
          description: desc,
          amount,
          dueDate: safeDate,
          isPaid: true,
        })
      }
    } else if (amount > 0) {
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
