<template>
  <div class="ui-menu-separator"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'menu-separator',
});
</script>

<style scoped lang="less">
.ui-menu-separator {
  display: block;
  border-top: 1px solid #e9e9e9;
  margin-top: .4em;
  margin-bottom: .4em;
}
</style>
