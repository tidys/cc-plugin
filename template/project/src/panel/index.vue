<template>
  <div class="panel">
    Hi, {{ msg }}
    <CCButton @click="onClickBtn">btn click-{{ count }}</CCButton>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, provide, nextTick } from 'vue';
import PluginConfig from '../../cc-plugin.config';
import ccui from '@xuyanfeng/cc-ui';
const { CCInput, CCButton } = ccui.components;
export default defineComponent({
  name: 'index',
  components: { CCButton },
  setup(props, { emit }) {
    onMounted(() => {
      console.log('hi ~~~');
    });
    const msg = ref(PluginConfig.manifest.name);
    const count = ref(0);
    return {
      msg,
      count,
      onClickBtn() {
        count.value++;
        console.log('click btn');
      },
    };
  },
});
</script>

<style scoped lang="less">
.panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
