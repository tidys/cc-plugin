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
import {defineComponent, ref, PropType, watch} from "vue";

interface Option {
  label: string,
  value: string | number,
}

export default defineComponent({
  name: "cc-select",
  props: {
    data: {
      type: Array as PropType<Option[]>,
      required: true,
      default() {
        return [];
      },
    },
    value: [String, Number],
  },
  emits: ["change", 'update:data', 'update:value'],
  setup(props: any, { emit }) {
    const curValue = ref(props.value?.toString() || '')
    watch(() => props.value, (val) => {
      curValue.value = val.toString();
    })
    return {
      curValue,
      onSelectChange() {
        const val = curValue.value.toString();
        emit("update:value", val);
        emit("change", val);
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
