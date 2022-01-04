<template>
  <div class="cc-input">
    <label style="display: flex;flex: 1;">
      <input @focusout="onFocusout"
             @focusin="onFocusin"
             @blur="onBlur"
             v-model="data"
             type="text"/>
    </label>
    <slot></slot>
  </div>

</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'cc-input',
  props: {
    data: {
      type: String
    }
  },
  setup() {
    const focusColor = '#fd942b'
    const borderColor = ref('transparent')
    const data = ref('')
    return {
      data,
      borderColor,
      onFocusin() {
        borderColor.value = focusColor
      },
      onFocusout() {
        borderColor.value = 'transparent'
      },
      onBlur(){
        console.log(data.value);
      },
    }
  }
})
</script>

<style scoped lang="less">
.cc-input {
  display: flex;
  flex: 1;

  input {
    border: 1px solid #171717;
    border-radius: 3px;
    margin: 0;
    padding: .17em .5em;
    width: 100%;
    display: inline-block;
    outline: none;
    background: #262626;
    font-size: 12px;
    height: 21px;
    box-sizing: border-box;
    color: #fd942b;

    &:hover {
      border-color: #888;
    }

    &:focus {
      border-color: #fd942b;
    }
  }
}
</style>
