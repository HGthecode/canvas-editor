
import { DeepRequired } from '../interface/Common'
import {IEditorOption} from '../interface/Editor'
import { Command } from '../core/command/Command'
import { createApp } from 'vue'
import Toolbar from './Toolbar.vue'
import { IRangeStyle } from '../interface/Listener'
import piniaStore,{useEditorStore} from '../store'


export class DrawToolbar {
    private container: HTMLDivElement
    private editorOption: DeepRequired<IEditorOption>
    private command: Command
    private toolbarInstance:any
    private editorStore:any
    private currentRangeStyleString:string
  
    constructor(
      rootContainer: HTMLElement,
      command: Command,
      editorOptions: DeepRequired<IEditorOption>,
    ) {
      this.command = command
      this.container = this._wrapContainer(rootContainer)
      this.editorOption = editorOptions
      this.currentRangeStyleString = ''
      
     
      this.render()
    }

    public getOptions(){
      return this.editorOption
    }

    private _wrapContainer(rootContainer: HTMLElement): HTMLDivElement {
        const container = document.createElement('div')
        container.className = 'editor-toolbar'
        const pageContainer = rootContainer.getElementsByClassName('editor-content-wraper')
        if (pageContainer) {
          rootContainer.insertBefore(container,pageContainer[0])
        }
        
        return container
    }

    public reRender(payload:IRangeStyle|null=null){
      if (this.editorStore) {
        const payloadString = JSON.stringify(payload)
        if (this.currentRangeStyleString!=payloadString) {
          this.currentRangeStyleString = payloadString
          this.editorStore.setRangeStyle(payload)
        }
      }else{
        this.editorStore = useEditorStore()
      }
    }
  
  
    public render(payload:IRangeStyle|null=null) {
      if (this.toolbarInstance) {
        this.toolbarInstance.unmount()
      }
      const toolbarInstance = createApp(Toolbar,{
        command:this.command,
        editorOption:this.editorOption,
        rangeStyle:payload
      })
      toolbarInstance.use(piniaStore)
      toolbarInstance.mount(this.container)
      this.toolbarInstance = toolbarInstance
      
    }
  
    public destroy() {
      // this.container.remove()
      // this.globalEvent.removeEvent()
      // this.scrollObserver.removeEvent()
      // this.selectionObserver.removeEvent()
    }
  }