import { IDataSource } from '../../interface/dataSource/DataSource'
import { getObjectValueByKey } from '../../utils/index'

export class DataSource {
  private data: IDataSource = {}

  public setData(data: IDataSource) {
    this.data = data
  }

  public getData(): IDataSource {
    return this.data
  }
  public getValueByKey(key: string): any {
    if (key.indexOf('root.') > -1) {
      key = key.replace('root.', '')
    }
    console.log('getValue', key)

    return getObjectValueByKey(key, this.data)
  }
}
