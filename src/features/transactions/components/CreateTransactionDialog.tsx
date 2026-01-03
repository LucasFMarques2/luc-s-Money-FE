import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'
import { Input } from '../../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'

import {
  transactionSchema,
  type TransactionFormValues,
} from '../schemas/transactionSchema'
import {
  useTransactions,
  CATEGORY_IDS,
} from '../../../context/TransactionsContext'

export const CreateTransactionDialog = () => {
  const [open, setOpen] = useState(false)
  const { createTransaction } = useTransactions()

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
      category: '',
      type: 'expense',
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedType = form.watch('type')

  const filteredCategories = Object.keys(CATEGORY_IDS).filter(catName => {
    const isIncome = ['Salário', 'Extra'].includes(catName)
    return selectedType === 'income' ? isIncome : !isIncome
  })

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      const categoryId = CATEGORY_IDS[data.category]

      if (!categoryId) {
        toast.error('Categoria inválida')
        return
      }

      await createTransaction({
        categoryId,
        description: data.description,
        amount: data.amount,
        dueDate: new Date().toISOString().split('T')[0],
        installments: 1,
        isPaid: true,
      })

      toast.success('Transação salva com sucesso!', {
        description: `${data.description} no valor de R$ ${data.amount}`,
      })

      setOpen(false)
      form.reset()
    } catch (error) {
      toast.error('Erro ao salvar transação')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='bg-emerald-600 hover:bg-emerald-700 text-white gap-2'>
          <Plus className='h-4 w-4' />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-106.25 bg-zinc-950 border-zinc-800 text-zinc-100'>
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription className='text-zinc-400'>
            Adicione uma nova entrada ou saída ao seu controle.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ex: Supermercado'
                      {...field}
                      className='bg-zinc-900 border-zinc-800'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      placeholder='0,00'
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                      className='bg-zinc-900 border-zinc-800'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={val => {
                        field.onChange(val)
                        form.setValue('category', '')
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='bg-zinc-900 border-zinc-800'>
                          <SelectValue placeholder='Selecione' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='bg-zinc-900 border-zinc-800 text-zinc-100'>
                        <SelectItem value='income'>Entrada</SelectItem>
                        <SelectItem value='expense'>Saída</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className='bg-zinc-900 border-zinc-800'>
                          <SelectValue placeholder='Categoria' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='bg-zinc-900 border-zinc-800 text-zinc-100'>
                        {filteredCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type='submit'
                className='w-full bg-emerald-600 hover:bg-emerald-700'
              >
                Salvar Transação
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
