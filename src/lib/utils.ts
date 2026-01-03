import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Converte data para string YYYY-MM-DD local, sem conversão UTC
export function formatDateToAPI(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Pega o nome do mês atual (ex: Janeiro/2026)
export function getCurrentMonthLabel() {
  const date = new Date()
  const month = date.toLocaleString('pt-BR', { month: 'long' })
  const year = date.getFullYear()
  return `${month.charAt(0).toUpperCase() + month.slice(1)}/${year}`
}
