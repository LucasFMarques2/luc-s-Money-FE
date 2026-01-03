import { useState } from 'react'
import { Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTransactionsController } from '../hooks/useTransactionsController'
import { CreateTransactionDialog } from '../components/CreateTransactionDialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Badge } from '../../../components/ui/badge'
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

export const TransactionsView = () => {
  const { transactions, isLoading, deleteTransaction } =
    useTransactionsController()

  // Estados para Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())

  // Funções de Navegação de Mês
  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  // Lógica de Filtragem Principal
  const filteredTransactions = transactions.filter(t => {
    // 1. Filtro de Data (Mês/Ano)
    // Parse seguro da data string YYYY-MM-DD
    const [yearStr, monthStr] = t.due_date.split('T')[0].split('-')
    const tMonth = Number(monthStr) - 1 // Meses no JS são 0-11
    const tYear = Number(yearStr)

    const isSameMonth =
      tMonth === currentDate.getMonth() && tYear === currentDate.getFullYear()

    // 2. Filtro de Busca (Texto)
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      t.description.toLowerCase().includes(searchLower) ||
      t.category_name.toLowerCase().includes(searchLower)

    return isSameMonth && matchesSearch
  })

  // Ordena por dia
  const sortedTransactions = filteredTransactions.sort((a, b) => {
    const dayA = Number(a.due_date.split('T')[0].split('-')[2])
    const dayB = Number(b.due_date.split('T')[0].split('-')[2])
    return dayA - dayB
  })

  // Cálculo rápido do mês atual para display
  const monthLabel = currentDate.toLocaleString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
  const formattedMonthLabel =
    monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  const totalIncome = sortedTransactions
    .filter(t => t.type?.toUpperCase() === 'INCOME')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalExpense = sortedTransactions
    .filter(t => t.type?.toUpperCase() !== 'INCOME')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-foreground'>
            Transações
          </h1>
          <p className='text-muted-foreground'>
            Gerencie suas entradas e saídas financeiras.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <CreateTransactionDialog />
        </div>
      </div>

      {/* Barra de Controles: Navegação de Mês + Busca */}
      <div className='flex flex-col md:flex-row gap-4 justify-between items-end md:items-center'>
        {/* Navegador de Meses */}
        <div className='flex items-center gap-4 bg-zinc-950 p-2 rounded-lg border border-zinc-800'>
          <Button variant='ghost' size='icon' onClick={prevMonth}>
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <span className='min-w-35 text-center font-medium text-zinc-200'>
            {formattedMonthLabel}
          </span>
          <Button variant='ghost' size='icon' onClick={nextMonth}>
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>

        {/* Busca */}
        <div className='flex items-center gap-2 w-full md:w-auto'>
          <div className='relative flex-1 md:w-80'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Buscar por nome ou categoria...'
              className='pl-9 bg-background border-zinc-800'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {/* <Button variant='outline' className='gap-2 text-muted-foreground border-zinc-800'>
            <Filter className='h-4 w-4' />
            Filtros
          </Button> */}
        </div>
      </div>

      {/* Resumo Rápido do Mês Selecionado */}
      <div className='grid grid-cols-2 gap-4 md:w-1/2 lg:w-1/3'>
        <Card className='bg-zinc-950/50 border-zinc-800 p-4 py-3'>
          <div className='text-xs text-zinc-500 uppercase font-bold'>
            Entradas
          </div>
          <div className='text-emerald-500 font-bold'>
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalIncome)}
          </div>
        </Card>
        <Card className='bg-zinc-950/50 border-zinc-800 p-4 py-3'>
          <div className='text-xs text-zinc-500 uppercase font-bold'>
            Saídas
          </div>
          <div className='text-rose-500 font-bold'>
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(totalExpense)}
          </div>
        </Card>
      </div>

      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle>Histórico - {formattedMonthLabel}</CardTitle>
          <CardDescription>
            Lista de movimentações referentes a este mês.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className='hover:bg-muted/50 border-border'>
                <TableHead className='w-32'>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Valor</TableHead>
                <TableHead className='w-12'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <TableRow key={i} className='h-16'>
                    <TableCell
                      colSpan={6}
                      className='text-center text-muted-foreground animate-pulse'
                    >
                      Carregando...
                    </TableCell>
                  </TableRow>
                ))
              ) : sortedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='text-center py-12 text-muted-foreground'
                  >
                    Nenhuma transação encontrada em{' '}
                    <strong>{formattedMonthLabel}</strong>.
                  </TableCell>
                </TableRow>
              ) : (
                sortedTransactions.map(t => {
                  const isCompleted = !!t.payment_date
                  const isIncome = t.type?.toUpperCase() === 'INCOME'

                  // Formatação de data segura
                  const [year, month, day] = t.due_date.split('T')[0].split('-')
                  const displayDate = `${day}/${month}/${year}`

                  return (
                    <TableRow
                      key={t.id}
                      className='hover:bg-muted/50 border-border group'
                    >
                      <TableCell className='font-medium text-muted-foreground'>
                        {displayDate}
                      </TableCell>
                      <TableCell className='text-foreground font-medium'>
                        {t.description}
                        {/* Exibe indicador de parcela se existir */}
                        {t.installment_total && t.installment_total > 1 && (
                          <span className='ml-2 text-xs text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800'>
                            {t.installment_current}/{t.installment_total}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className='border-zinc-700 text-zinc-400'
                        >
                          {t.category_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            isCompleted
                              ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-0'
                              : 'bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/25 border-0'
                          }
                        >
                          {isCompleted ? 'Concluído' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-bold ${
                          isIncome ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {isIncome ? '+ ' : '- '}
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(Number(t.amount))}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => deleteTransaction(t.id)}
                          className='opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-rose-500 hover:bg-transparent'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
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
  )
}
