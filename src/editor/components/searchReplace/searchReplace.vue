<template>
  <drag-window
    v-model:visible="state.visible"
    title="查找/替换"
    :position="{ left: 'right', top: 80 }"
    :width="350"
    @close="onCloseWindow"
  >
    <div>
      <a-input-group compact>
        <a-input
          v-model:value="state.keyword"
          placeholder="关键词"
          style="width: calc(100% - 64px)"
          @change="onKeywordChange"
        >
          <template #suffix>
            <span>{{ state.searchResult }}</span>
          </template>
        </a-input>
        <a-button @click="onPreClick">
          <template #icon><LeftOutlined /></template>
        </a-button>
        <a-button @click="onNextClick">
          <template #icon><RightOutlined /></template>
        </a-button>
      </a-input-group>
      <div style="margin-top: 10px">
        <a-input
          v-model:value="state.replaceKeyword"
          style="width: calc(100% - 74px); margin-right: 10px"
        />
        <a-button @click="onReplace"> 替换 </a-button>
      </div>
    </div>
  </drag-window>
</template>

<script setup lang="ts">
  import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
  import { onMounted, reactive } from 'vue'
  import DragWindow from '../DragWindow/DragWindow.vue'
  import {Button,InputGroup,Input} from 'ant-design-vue';
  const AButton =Button
  const AInputGroup = InputGroup
  const AInput = Input

  const props = defineProps({
    command:{
      type:Object,
      default:()=>{}
    }
  })

  const state = reactive<{
    visible: boolean
    searchResult: string
    keyword: string
    replaceKeyword: string
  }>({
    visible: false,
    searchResult: '',
    keyword: '',
    replaceKeyword: '',
  })

  function onCloseWindow() {
    props.command.search(null)
    setSearchResult()
  }

  function setSearchResult() {
    const result = props.command.getSearchNavigateInfo()
    if (result) {
      const { index, count } = result
      state.searchResult = `${index}/${count}`
    } else {
      state.searchResult = ''
    }
  }

  const onKeywordChange = (e:any) => {
    const { value } = e.target
    props.command.search(value || null)
    setSearchResult()
  }

  const onPreClick = () => {
    props.command.searchNavigatePre()
    setSearchResult()
  }
  const onNextClick = () => {
    props.command.searchNavigateNext()
    setSearchResult()
  }
  const onReplace = () => {
    const searchValue = state.keyword
    const replaceValue = state.replaceKeyword
    if (searchValue && replaceValue && searchValue !== replaceValue) {
      props.command.replace(replaceValue)
    }
  }

  onMounted(() => {
    state.visible = true
    // setTimeout(() => {
    //   onModalDrag()
    // }, 100)
  })
</script>

