import { IWatermark } from '../../'
import { CommandAdapt } from '../../core/command/CommandAdapt'

export interface WatermarkSettingModalProps {
  data: IWatermark
  onSubmit?: (values: WatermarkSettingSubmitResult) => void
  onCancel?: () => void
  command?:CommandAdapt
}


export type WatermarkSettingSubmitResult = IWatermark
