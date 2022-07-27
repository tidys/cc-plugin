<template>
  <div class="ui-menu" v-show="menus.length>0" :style="{left:menuPositionX+'px', top:menuPositionY+'px'}">
    <MenuItem v-for="(menu, index) in menus" :key="index"
              :data="menu">
    </MenuItem>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { IUiMenuItem, MenuOptions, Msg } from './index';
import MenuItem from './menu-item.vue';
import { Emitter } from '../index';


export default defineComponent({
  name: 's-menu',
  components: { MenuItem },


  setup(props) {
    const menus = ref<IUiMenuItem[]>([]);
    document.addEventListener('mousedown', () => {
      menus.value = [];
    }, { capture: true });
    const menuPositionX = ref(0);
    const menuPositionY = ref(0);
    onMounted(() => {
      Emitter.on(Msg.ShowMenu, (options: MenuOptions, newMenus: IUiMenuItem[]) => {
        menuPositionX.value = Math.abs(options.x);
        menuPositionY.value = Math.abs(options.y);
        menus.value = newMenus;
      });
    });
    return {
      menus,
      menuPositionX,
      menuPositionY,
    };
  },

});
</script>

<style scoped lang="less">
.ui-menu {
  border: #2a2a2a solid 1px;
  box-shadow: #d3d6d9;
  background-color: #eeeff1;
  min-width: 100px;
  max-width: 100px;
}
</style>
