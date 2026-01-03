import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'
import {
  FiArrowUp,
  FiArrowDown,
  FiDollarSign,
  FiActivity,
} from 'react-icons/fi'

import { useDashboardController } from '../hooks/useDashboardController'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../components/ui/chart'

// Definição explícita de cores para garantir que o gráfico as use
const chartConfig = {
  income: {
    label: 'Entradas',
    color: '#10b981', // emerald-500
  },
  expenses: {
    label: 'Saídas',
    color: '#f43f5e', // rose-500
  },
}

interface KpiCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: string
}

const KpiCard = ({ title, value, icon: Icon, color }: KpiCardProps) => (
  <Card className='bg-card border-border'>
    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
      <CardTitle className='text-sm font-medium text-muted-foreground'>
        {title}
      </CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className='text-2xl font-bold text-card-foreground'>
        {new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value)}
      </div>
    </CardContent>
  </Card>
)

export const DashboardView = () => {
  const { metrics, chartData, recentTransactions, isLoading } =
    useDashboardController()

  if (isLoading)
    return (
      <div className='p-8 text-zinc-400 animate-pulse'>
        Carregando dados financeiros...
      </div>
    )

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <KpiCard
          title='Saldo Total'
          value={metrics.balance}
          icon={FiDollarSign}
          color='text-emerald-500'
        />
        <KpiCard
          title='Investimentos'
          value={metrics.investments}
          icon={FiActivity}
          color='text-blue-500'
        />
        <KpiCard
          title='Gastos (Mês)'
          value={metrics.expenses}
          icon={FiArrowDown}
          color='text-rose-500'
        />
        <KpiCard
          title='Entradas (Mês)'
          value={metrics.income}
          icon={FiArrowUp}
          color='text-emerald-500'
        />
      </div>

      <div className='grid gap-4 md:grid-cols-7'>
        <Card className='col-span-4 bg-zinc-950 border-zinc-800'>
          <CardHeader>
            <CardTitle className='text-zinc-100'>Fluxo de Caixa</CardTitle>
            <CardDescription>Entradas vs Saídas (mensal)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-75 w-full min-h-75'>
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className='h-full w-full'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id='fillIncome'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='5%'
                            stopColor={chartConfig.income.color}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset='95%'
                            stopColor={chartConfig.income.color}
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id='fillExpenses'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='5%'
                            stopColor={chartConfig.expenses.color}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset='95%'
                            stopColor={chartConfig.expenses.color}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        vertical={false}
                        stroke='hsl(var(--border))'
                        strokeDasharray='3 3'
                        opacity={0.4}
                      />
                      <XAxis
                        dataKey='month'
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        stroke='#71717a'
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={value => `R$${value / 1000}k`}
                        stroke='#71717a'
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent indicator='dot' />}
                      />
                      <Area
                        type='monotone'
                        dataKey='income'
                        stroke={chartConfig.income.color}
                        fillOpacity={1}
                        fill='url(#fillIncome)'
                        strokeWidth={2}
                        stackId='1'
                      />
                      <Area
                        type='monotone'
                        dataKey='expenses'
                        stroke={chartConfig.expenses.color}
                        fillOpacity={1}
                        fill='url(#fillExpenses)'
                        strokeWidth={2}
                        stackId='2'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className='h-full flex items-center justify-center text-zinc-500'>
                  Adicione transações para visualizar o gráfico.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='col-span-3 bg-zinc-950 border-zinc-800 flex flex-col'>
          <CardHeader>
            <CardTitle className='text-zinc-100'>Últimas Transações</CardTitle>
            <CardDescription>
              Movimentações recentes da sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex-1 overflow-auto'>
            <Table>
              <TableHeader>
                <TableRow className='border-zinc-800 hover:bg-zinc-900/50'>
                  <TableHead className='text-zinc-400'>Transação</TableHead>
                  <TableHead className='text-right text-zinc-400'>
                    Valor
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className='text-center text-zinc-500 py-4'
                    >
                      Nenhuma transação recente
                    </TableCell>
                  </TableRow>
                ) : (
                  recentTransactions.map(transaction => {
                    // Normalização para garantir a cor correta
                    const isIncome =
                      transaction.type?.toUpperCase() === 'INCOME'

                    return (
                      <TableRow
                        key={transaction.id}
                        className='border-zinc-800 hover:bg-zinc-900/50'
                      >
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-medium text-zinc-200'>
                              {transaction.description}
                            </span>
                            <span className='text-xs text-zinc-500'>
                              {transaction.category_name} •{' '}
                              {new Date(
                                transaction.due_date
                              ).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          <span
                            className={`font-medium ${
                              isIncome ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                          >
                            {isIncome ? '+ ' : '- '}
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(transaction.amount)}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
