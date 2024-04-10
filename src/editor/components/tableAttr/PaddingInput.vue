<template>
  <div v-if="value" class="padding-input-wraper">
    <div class="padding-input-item">
        <label class="padding-label">上:</label>
        <a-input-number size="small" v-model:value="value[0]" placeholder="上" style="width:55px" @change="onChange($event,0)"></a-input-number>
    </div>
    <div class="padding-input-item">
        <label class="padding-label">右:</label>
        <a-input-number size="small" v-model:value="value[1]" placeholder="右" style="width:55px" @change="onChange($event,1)"></a-input-number>
    </div>
    <div class="padding-input-item">
        <label class="padding-label">下:</label>
        <a-input-number size="small" v-model:value="value[2]" placeholder="下" style="width:55px" @change="onChange($event,2)"></a-input-number>
    </div>
    <div class="padding-input-item">
        <label class="padding-label">左:</label>
        <a-input-number size="small" v-model:value="value[3]" placeholder="左" style="width:55px" @change="onChange($event,3)"></a-input-number>
    </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { Form,InputNumber } from 'ant-design-vue';

export default defineComponent({
  components:{
    AInputNumber:InputNumber
  },
  props: {
    value: { type: Array as PropType<number[]>, isRequired: true },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const formItemContext = Form.useInjectFormItemContext();
    const onChange = (val:number,index:number) => {
      const values = props.value?[...props.value]:[]
      values[index] = val
      emit('update:value', values);
      formItemContext.onFieldChange();
    };
   
    return {
      onChange,
    };
  },
});
</script>

<style lang='css' scoped>
.padding-input-wraper{
    display: flex;
}
.padding-label{
    line-height: 24px;
}
.padding-input-item{
    display: flex;
    margin-right: 5px;
}
</style>