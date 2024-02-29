<template>
  <a-upload
    v-if="visible"
    style="display: none"
    name="file"
    class="editorUpLoadImage"
    :beforeUpload="beforeUpload"
  >
    <a-button>Click to Upload {{ visible }}</a-button>
  </a-upload>
</template>

<script setup lang="ts">
  import { onMounted,ref } from 'vue'
  import {
  Button,Upload
} from 'ant-design-vue';

  const AButton = Button
  const AUpload = Upload

  const props = defineProps({
    onSubmit: {
      type: Function,
      default: () => {
        return {}
      },
    },
    onCancel: {
      type: Function,
      default: () => {
        return
      },
    },
  })

  const visible = ref(false)

  const beforeUpload = (file:Blob) => {
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.onload = function () {
      const image = new Image()
      const value = fileReader.result as string
      image.src = value
      image.onload = function () {
        props.onSubmit({
          value,
          width: image.width,
          height: image.height,
        })
        visible.value = false
      }
    }
  }

  const onClick = () => {
    const uploadInput = document.querySelector<HTMLDivElement>(
      '.editorUpLoadImage .ant-upload input',
    )!
    uploadInput.click()
  }
  visible.value = true
  onMounted(() => {
    onClick()
  })
</script>

<style lang="css" scoped></style>
