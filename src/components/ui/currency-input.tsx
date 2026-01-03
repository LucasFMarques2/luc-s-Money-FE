import React, { useEffect } from 'react'
import { Input } from './input'

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number | string
  onChange: (value: number) => void
}

export const CurrencyInput = ({
  value,
  onChange,
  className,
  ...props
}: CurrencyInputProps) => {
  const format = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(val)

  // Estado interno para controlar o texto exibido
  const [displayValue, setDisplayValue] = React.useState(
    format(Number(value) || 0)
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayValue(format(Number(value) || 0))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    const numberValue = Number(rawValue) / 100

    setDisplayValue(format(numberValue))
    onChange(numberValue)
  }

  return (
    <Input
      {...props}
      type='text'
      inputMode='numeric'
      value={displayValue}
      onChange={handleChange}
      className={className}
    />
  )
}
