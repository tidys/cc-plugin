<template>
  <div class="cc-textarea">
    <label>
      <textarea v-model="text" placeholder="" @change="onChange"></textarea>
    </label>
  </div>
</template>
<script lang="ts">
import {defineComponent, ref} from "vue"

export default defineComponent({
  name: "cc-textarea",
  emits: ['change', 'update:data'],
  props: {
    data: { type: String, default: '' }
  },
  setup(props, { emit }) {
    const text = ref(props.data)
    return {
      text,
      onChange() {
        emit('update:data', text.value)
        emit('change', text.value)
      }
    }
  }
})
</script>
<style scoped lang="less">
.cc-textarea {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  background: #262626;
  border-radius: 3px;
  color: #333333;
  font-size: 1.5em;
  font-weight: 700;


  textarea {
    display: block;
    resize: vertical;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    outline: none;
    margin: 0;
    word-break: break-all;
    padding: 0.084em 0.5em;
    min-height: 4.084em;

    border-radius: 3px;
    border: 1px solid #171717;
    background: 0 0;
    color: #fd942b;

    &:focus {
      border-color: #fd942b;
    }
  }

}
</style>
