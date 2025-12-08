'use client'

import { Dropdown, DropdownOption } from './Dropdown'
import { Select } from './Select'

export interface ResponsiveSelectProps {
  label?: string
  error?: string
  fullWidth?: boolean
  options: DropdownOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * ResponsiveSelect - A unified component that renders:
 * - Custom Dropdown on desktop/laptop (md and up)
 * - Native Select on mobile/tablet (below md)
 */
export function ResponsiveSelect({
  label,
  error,
  fullWidth = true,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className,
}: ResponsiveSelectProps) {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <>
      {/* Desktop/Laptop - Custom Dropdown */}
      <Dropdown
        label={label}
        error={error}
        fullWidth={fullWidth}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />

      {/* Mobile/Tablet - Native Select */}
      <Select
        label={label}
        error={error}
        fullWidth={fullWidth}
        value={value}
        onChange={handleSelectChange}
        disabled={disabled}
        className={className}
      >
        {placeholder && (
          <option
            value=''
            disabled
          >
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </Select>
    </>
  )
}

// Re-export types for convenience
export type { DropdownOption }
