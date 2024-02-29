import { defineStore } from 'pinia'
import {EditorState} from './types'
import piniaStore from './index'

export const useEditorStore = defineStore('editor', {
  state: (): EditorState => ({
    rangeStyle:{}
  }),
  getters: {},
  actions: {
    setRangeStyle(data:any) {
      this.rangeStyle = data
    },
  },
})

export function useAppOutsideStore() {
  return useEditorStore(piniaStore)
}
