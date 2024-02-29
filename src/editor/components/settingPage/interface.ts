import { PaperDirection } from '../../'
import { CommandAdapt } from '../../core/command/CommandAdapt'

export interface PageSettingModalProps {
  onSubmit?: (values: PageSettingSubmitResult) => void
  onCancel?: () => void
  command?:CommandAdapt
}

export interface PageSettingData {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
  direction: PaperDirection
}

export interface PageSettingSubmitResult extends PageSettingData {
  direction: PaperDirection
  paperSize: string
}

export interface pageSettingMaring {
  left: number
  top: number
  right: number
  bottom: number
}
