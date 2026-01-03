import { useTransactions } from '../../../context/TransactionsContext'

export const useTransactionsController = () => {
  const { transactions, isLoading, deleteTransaction } = useTransactions()

  return {
    transactions,
    isLoading,
    deleteTransaction,
  }
}
