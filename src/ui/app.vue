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
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import CcButton from './packages/cc-button/index.vue';
import CcSection from './packages/cc-section/index.vue';
import CcInput from './packages/cc-input/index.vue';

export default defineComponent({
  name: 'app',
  components: { CcInput, CcSection, CcButton },
})

</script>
<style>

</style>
