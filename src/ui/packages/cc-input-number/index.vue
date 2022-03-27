<template>
  <div class="cc-input-number">
    <label>
      <input ref="input" v-model="val" type="number"
             @change="onChange"
      />
    </label>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from 'vue';

export default defineComponent({
  name: "cc-input-number",
  emits: ['change', 'update:value'],
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Number,
      required: true,
      default: 0,
    },
    min: {
      type: Number,
    },
    max: {
      type: Number,
    },
    step: {
      type: Number,
    },
  },
  setup(props, { emit }) {
    const input = ref();
    const val = ref(props.value);
    onMounted(() => {
      if (props.min !== undefined) {
        (input.value as Element).setAttribute('min', props.min.toString());
      }
      if (props.max !== undefined) {
        (input.value as Element).setAttribute('max', props.max.toString());
      }

      if (props.step !== undefined) {
        (input.value as Element).setAttribute('step', props.step.toString());
      }
    })
    let preVal = props.value;
    return {
      val, input,
      onChange() {
        if (val.value === '') {
          val.value = preVal;
        }
        preVal = val.value;
        emit('update:value', val.value);
        emit('change');
      }
    };
  }
})
</script>

<style scoped lang="less">
.cc-input-number {
  display: flex;

  label {
    height: 100%;
    width: 100%;
    display: flex;

    input {
      height: 100%;
      width: 100%;
      outline: none;
      border: 1px solid #171717;
      margin: 0;
      box-sizing: border-box;

    }
  }


}
</style>