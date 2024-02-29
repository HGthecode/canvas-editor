export interface ButtonPickerProps {
  value: string | number
  options: ButtonPickerOptionItem[]
  mode?: 'check' | 'button'
  multiple?: boolean
}

export interface ButtonPickerOptionItem {
  label: string
  value: string | number
  icon?: string
  image?: string
}
