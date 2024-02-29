
import { DeepRequired } from '../interface/Common'
import {IEditorOption} from '../interface/Editor'
import { Command } from '../core/command/Command'
import { createApp } from 'vue'
import Menus from './Menus.vue'

export class DrawMenus {
    private container: HTMLDivElement
    private editorOption: DeepRequired<IEditorOption>

    private command: Command
  
    constructor(
      rootContainer: HTMLElement,
      command: Command,
      editorOptions: DeepRequired<IEditorOption>
    ) {
      this.command = command
      
      this.container = this._wrapContainer(rootContainer)
      this.editorOption = editorOptions
     
      this.render()
    }

    public getOptions(){
      return this.editorOption
    }

    private _wrapContainer(rootContainer: HTMLElement): HTMLDivElement {
        const container = document.createElement('div')
        container.className = 'editor-menus'
        const pageContainer = rootContainer.getElementsByClassName('editor-content-wraper')
        if (pageContainer) {
          rootContainer.insertBefore(container,pageContainer[0])
        }
        
        return container
    }
  
  
    public render() {
      const confirmInstance = createApp(Menus,{
        command:this.command,
        editorOption:this.editorOption
      })
      confirmInstance.mount(this.container)
    }
  
    public destroy() {
      // this.container.remove()
      // this.globalEvent.removeEvent()
      // this.scrollObserver.removeEvent()
      // this.selectionObserver.removeEvent()
    }
  }