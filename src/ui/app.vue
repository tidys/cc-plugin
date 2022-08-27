<template>
  <div style="display: flex;flex-direction: column;">
    <CCSection name="TEST">
      <template v-slot:header>
        <div style="display: flex;flex:1;flex-direction: row;justify-content: flex-end;">
          <CCButton>a</CCButton>
          <CCButton>b</CCButton>
        </div>
      </template>
      <div>
        <CCProp name="input" tooltip="测试tooltip">
          <CCInput @change="onChangeText" v-model:value="value"></CCInput>
        </CCProp>
        <CCProp name="disabled" tooltip="测试禁用">
          <CCInput :disabled="true" value="disabled"></CCInput>
        </CCProp>
        <CCProp name="readonly">
          <CCInput :readonly="true" value="readonly"></CCInput>
        </CCProp>
        <CCProp name="readonly && disabled">
          <CCInput :disabled="true" :readonly="true" value="readonly"></CCInput>
        </CCProp>
        <CCProp name="test2">
          <CCSelect
              @change="onChangeSelect"
              :data="selectData"
              v-model:value="selectValue">
          </CCSelect>
        </CCProp>
      </div>
    </CCSection>
    <CCSection :expand="false" name="测试折叠">
      默认不展开
    </CCSection>
    <CCProp name="iconfont">
      <i class="iconfont icon-refresh"></i>
      <div class="iconfont icon-doc"></div>
    </CCProp>
    <CCProp name="color">
      <CCColor></CCColor>
    </CCProp>
    <CCProp name="input number">
      <CCInputNumber :value="1" :min="0"></CCInputNumber>
    </CCProp>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import CCButton from './packages/cc-button/button.vue';
import CCSection from './packages/cc-section/section.vue';
import CCInput from './packages/cc-input/input.vue';
import CCProp from './packages/cc-prop/prop.vue';
import CCSelect from './packages/cc-select/select.vue';
import CCInputNumber from './packages/cc-input-number/index.vue'
import CCColor from "./packages/cc-color/color.vue";

export default defineComponent({
  name: 'app',
  components: {
    CCColor, CCSelect, CCProp, CCInput, CCSection, CCButton, CCInputNumber,
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
