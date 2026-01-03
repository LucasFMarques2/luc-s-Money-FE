import { z } from 'zod'

export const transactionSchema = z.object({
  description: z.string().min(2, {
    message: 'A descrição deve ter pelo menos 2 caracteres.',
  }),

  amount: z.coerce
    .number()
    .min(0.01, { message: 'O valor deve ser maior que 0.' }),

  category: z.string().min(1, {
    message: 'Selecione uma categoria.',
  }),

  type: z.enum(['income', 'expense']),
})

export type TransactionFormInput = z.input<typeof transactionSchema>
export type TransactionFormOutput = z.output<typeof transactionSchema>

