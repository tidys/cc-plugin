<template>
  <div style="display: flex;flex-direction: column;">
    <cc-section title="生成Manifest">
      <template v-slot:header>
        <div style="display: flex;flex-direction: row;">
          <cc-button>a</cc-button>
          <cc-button>b</cc-button>
        </div>
      </template>
      <div>
        <cc-prop name="test1">
          <cc-input></cc-input>
        </cc-prop>
        <cc-prop name="test2">
          <cc-select></cc-select>
        </cc-prop>
      </div>
    </cc-section>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
// import CcButton from './packages/cc-button/button.vue';
// import CcSection from './packages/cc-section/index.vue';
// import CcInput from './packages/cc-input/index.vue';
// import CcProp from './packages/cc-prop/index.vue';
// import CcSelect from './packages/cc-select/index.vue';

export default defineComponent({
  name: 'app',
  // components: { CcSelect, CcProp, CcInput, CcSection, CcButton },
})

</script>
<style>
body{
}
</style>
