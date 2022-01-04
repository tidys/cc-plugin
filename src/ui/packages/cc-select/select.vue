<template>
  <div class="cc-select">
    <div>
      <label>
        <select @change="onSelectChange" v-model="curValue">
          <option
            v-for="(item, index) in data"
            :key="index"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
      </label>
    </div>
    <slot></slot>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "cc-select",
  props: {
    data: {
      type: Array,
      default() {
        return [
          { label: 1, value: "a" },
          { label: 2, value: "b" },
          { label: 3, value: "c" },
        ];
      },
    },
  },
  emits: ["change"],
  setup(props, { emit }) {
    const curValue = ref("c");
    // @ts-ignore
    const data = ref(props.data || []);
    return {
      data,
      curValue,
      onSelectChange() {
        console.log(curValue.value);
        emit("change", curValue.value);
      },
    };
  },
});
</script>

<style scoped lang="less">
.cc-select {
  position: relative;
  flex: 1;

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
    right: 0.8em;
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
