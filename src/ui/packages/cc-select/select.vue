<template>
  <div class="cc-select">
    <div>
      <label>
        <select>
          <option>1</option>
          <option>2</option>
          <option>3</option>
        </select>
      </label>
    </div>
    <slot></slot>
  </div>

</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'cc-select',
  setup() {

  },
})
</script>

<style scoped lang="less">
.cc-select {
  position: relative;

  select {
    appearance: none;
    display: flex;
    flex: 1;
    outline: 0;
    border: 1px solid #171717;
    text-overflow: ellipsis;
    color: #bdbdbd;
    background: 0 0;
    width: 100%;
    height: 21px;
    border-radius: 100px;
    padding: 0 0 0 8px;


    &:hover {
      border-color: #888;
    }

    &:focus {
      border-color: #fd942b;
    }
  }

  &:after {
    display: block;
    content: " ";
    position: absolute;
    right: .8em;
    top: 50%;
    width: 0;
    height: 0;
    pointer-events: none;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 7px solid #bdbdbd;
    margin-top: -3px;
  }

}
</style>
