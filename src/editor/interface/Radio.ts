export interface IRadio {
  value: boolean
  code?: string
  disabled?: boolean
  name?: string
  options?: IRadioOptionItem[]
}

export interface IRadioOptionItem {
  label: string
  value: string
  disabled?: boolean
}

export interface IRadioOption {
  width?: number
  radius?: number
  height?: number
  gap?: number
  lineWidth?: number
  lineStyle?: string
  fillStyle?: string
  fontStyle?: string
  itemMarginRight?: number
  fontWidth?: number
}
