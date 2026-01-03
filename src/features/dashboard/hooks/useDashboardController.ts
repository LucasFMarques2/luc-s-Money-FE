import { useTransactions } from '../../../context/TransactionsContext'

interface ChartDataPoint {
  month: string
  income: number
  expenses: number
  originalDate: Date
}

export const useDashboardController = () => {
  const { transactions, summary, isLoading } = useTransactions()

  const getLast6Months = () => {
    const months: ChartDataPoint[] = []
    const today = new Date()

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthLabel = d.toLocaleString('pt-BR', { month: 'short' })
      const year = d.getFullYear()

      months.push({
        month: `${monthLabel}/${year}`,
        income: 0,
        expenses: 0,
        originalDate: d,
      })
    }
    return months
  }

  const chartData = getLast6Months().map(monthData => {
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.due_date)
      const adjustedDate = new Date(
        tDate.valueOf() + tDate.getTimezoneOffset() * 60000
      )

      // Filtra apenas o que foi PAGO para o gráfico de fluxo de caixa realizado
      const isPaid = !!t.payment_date

      return (
        isPaid && // Apenas pagos entram no gráfico
        adjustedDate.getMonth() === monthData.originalDate.getMonth() &&
        adjustedDate.getFullYear() === monthData.originalDate.getFullYear()
      )
    })

    const income = monthTransactions
      .filter(t => t.type?.toUpperCase() === 'INCOME')
      .reduce((acc, t) => acc + Number(t.amount), 0)

    const expenses = monthTransactions
      .filter(t => t.type?.toUpperCase() !== 'INCOME')
      .reduce((acc, t) => acc + Number(t.amount), 0)

    return {
      month: monthData.month,
      income,
      expenses,
      rawDate: monthData.originalDate.getTime(),
    }
  })

  // FILTRO: Apenas transações CONCLUÍDAS (Pagas)
  const recentTransactions = transactions
    .filter(t => !!t.payment_date) // Verifica se payment_date existe
    .sort(
      (a, b) =>
        new Date(b.payment_date!).getTime() -
        new Date(a.payment_date!).getTime()
    ) // Ordena pela data de pagamento
    .slice(0, 5)

  return {
    metrics: {
      balance: summary.total,
      income: summary.income,
      expenses: summary.expenses,
      investments: summary.investments,
    },
    chartData,
    recentTransactions,
    isLoading,
  }
}
