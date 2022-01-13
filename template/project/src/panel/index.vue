<template>
  <div class="panel">
    Hi, {{ msg }}
  </div>
</template>
<script lang="ts">

import { defineComponent, onMounted, ref, provide, nextTick } from 'vue'
import PluginConfig from '../../cc-plugin.config'

export default defineComponent({
  name: 'index',
  setup(props, { emit }) {
    onMounted(() => {
      console.log('hi ~~~')
    })
    const msg = ref(PluginConfig.manifest.name)
    return {
      msg,
    }
  }
})
</script>

<style scoped lang="less">
.panel {

}
</style>
