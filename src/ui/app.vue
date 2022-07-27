<template>
  <div style="display: flex;flex-direction: column;">
    <cc-section name="TEST">
      <template v-slot:header>
        <div style="display: flex;flex:1;flex-direction: row;justify-content: flex-end;">
          <cc-button>a</cc-button>
          <cc-button>b</cc-button>
        </div>
      </template>
      <div>
        <cc-prop name="test1">
          <cc-input @change="onChangeText" v-model:value="value"></cc-input>
        </cc-prop>
        <cc-prop name="disabled">
          <cc-input :disabled="true" value="disabled"></cc-input>
        </cc-prop>
        <cc-prop name="readonly">
          <cc-input :readonly="true" value="readonly"></cc-input>
        </cc-prop>
        <cc-prop name="readonly && disabled">
          <cc-input :disabled="true" :readonly="true" value="readonly"></cc-input>
        </cc-prop>
        <cc-prop name="test2">
          <cc-select
              @change="onChangeSelect"
              v-model:data="selectData"
              v-model:value="selectValue">
          </cc-select>
        </cc-prop>
      </div>
    </cc-section>
    <i class="iconfont icon-refresh"></i>
    <div style="width: 100px; height: 100px;background: green;" class="iconfont icon-doc"></div>
    <CCInputNumber :value=10 :min=1 style="width: 100px;"></CCInputNumber>
    <CCColor></CCColor>
  </div>
</template>
<script lang="ts">
import {defineComponent, ref, onMounted} from 'vue'
// import CcButton from './packages/cc-button/button.vue';
// import CcSection from './packages/cc-section/index.vue';
// import CcInput from './packages/cc-input/index.vue';
// import CcProp from './packages/cc-prop/index.vue';
// import CcSelect from './packages/cc-select/index.vue';
import CCInputNumber from './packages/cc-input-number/index.vue'
import CCColor from "./packages/cc-color/color.vue";

export default defineComponent({
  name: 'app',
  components: {
    CCColor,
    // CcSelect, CcProp, CcInput, CcSection, CcButton,
    CCInputNumber,
  },
  setup() {
    const value = ref('123')
    const selectData = ref([
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
    ]);
    const selectValue = ref('1');
    onMounted(() => {
      setTimeout(() => {
        value.value = '456'
        selectValue.value = '3'
        selectData.value.push({ label: '4', value: 4 })
      }, 1000)
    })
    return {
      selectData,
      selectValue,
      value,
      onChangeText() {
        console.log(value.value);
      },
      onChangeSelect() {
        console.log(selectValue.value);
      }
    }
  }
})

</script>
<style>
body {
}
</style>
