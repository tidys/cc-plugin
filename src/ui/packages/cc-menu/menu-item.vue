<template>
  <div class="ui-menu-item" @mousedown.capture.stop.prevent="onClick">
    <span>{{ data.name }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IUiMenuItem } from './index';


export default defineComponent({
  name: 'menu-item',
  props: {
    data: {
      type: IUiMenuItem,
      required: true,
      default: () => {
        return new IUiMenuItem();
      },
    },
  },
  setup(props) {
    return {
      onClick() {
        const item: IUiMenuItem = props.data;
        if (item && item.callback) {
          item.callback(props.data);
        }
      },
    };
  },
});
</script>

<style scoped lang="less">
.ui-menu-item {
  cursor: pointer;

  span {
    user-select: none;
  }
}

.ui-menu-item:hover {
  background-color: #b0acac;
}
</style>
