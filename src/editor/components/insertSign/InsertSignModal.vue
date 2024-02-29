<template>
  <a-config-provider :locale="zhCN">
    <a-modal
      v-model:open="state.visible"
      :width="600"
      :maskClosable="false"
      title="插入签名"
      destroyOnClose
      @cancel="onModalCancel"
      @ok="onModalSubmit"
    >
      <div>
        <div class="actions mb-sm">
          <a-space warp>
            <!-- <a-button>
            <i class="iconfont icon-undo"></i>
          </a-button> -->
            <a-button @click="onReset">
              <i class="iconfont icon-delete"></i>
            </a-button>
          </a-space>
        </div>
        <div class="sign-wraper">
          <!-- <vue-esign
            ref="signRef"
            :width="552"
            :height="207"
            :isCrop="false"
            :lineWidth="4"
            lineColor="#000000"
          /> -->
        </div>
      </div>
    </a-modal>
  </a-config-provider>
</template>

<script setup lang="ts">
  import { reactive,ref,onMounted } from 'vue'
  import { ElementType } from '../../'
  // import vueEsign from 'vue-esign'
  import zhCN from 'ant-design-vue/es/locale/zh_CN'
  import {ConfigProvider,Modal,Space,Button} from 'ant-design-vue';
  const AConfigProvider =ConfigProvider
  const AModal = Modal
  const ASpace = Space
  const AButton = Button

  const props = defineProps({
    command:{
      type:Object,
      default:()=>{}
    }
  })

  const signRef = ref()
  onMounted(() => {
    state.visible = true
  })

  const state = reactive<{
    visible: boolean
  }>({
    visible: false,
  })

  function onModalSubmit() {
    signRef.value
      .generate()
      .then((base64:string) => {
        props.command.insertElementList([
          {
            type: ElementType.IMAGE,
            value: base64,
            width: 100,
            height: 38,
          },
        ])
        onModalCancel()
      })
      .catch(() => {})
  }
  function onReset() {
    signRef.value.reset()
  }
  function onModalCancel() {
    state.visible = false
  }
</script>

<style lang="css" scoped>
  .sign-wraper {
    background: #f3f5f7;
  }
</style>
