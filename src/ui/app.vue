<template>
  <div style="display: flex;flex-direction: column;">
    <cc-section>
      <template v-slot:header>
        header
      </template>
      <div>
        <cc-button>test</cc-button>
      </div>
    </cc-section>
    <cc-button>43453</cc-button>
    <cc-input></cc-input>
    <cc-prop name="test">
      <cc-input></cc-input>
    </cc-prop>
    <cc-select></cc-select>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import CcButton from './packages/cc-button/index.vue';
import CcSection from './packages/cc-section/index.vue';
import CcInput from './packages/cc-input/index.vue';
import CcProp from './packages/cc-prop/index.vue';
import CcSelect from './packages/cc-select/index.vue';

export default defineComponent({
  name: 'app',
  components: { CcSelect, CcProp, CcInput, CcSection, CcButton },
})

</script>
<style>

</style>
