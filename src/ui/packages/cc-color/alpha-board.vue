<template>
  <div class="board" :style="bgStyle"></div>
</template>
<script lang="ts">
import {ref, defineComponent, computed, defineEmits, reactive} from 'vue';
export default defineComponent({
  name: 'alpha-board',
  props: {
    size: {
      type: Number,
      default: 4,
    },
    white: {
      type: String,
      default: '#fff',
    },
    grey: {
      type: String,
      default: '#e6e6e6',
    },
  },
  setup(props, {emit}) {
    function getBoardImgData(color1:string, color2:string, size:number) :string {
      if (typeof document === 'undefined') {
        return '';
      }
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) {return '';}
      ctx.fillStyle = color1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color2;
      ctx.fillRect(0, 0, size, size);
      ctx.translate(size, size);
      ctx.fillRect(0, 0, size, size);
      return canvas.toDataURL();
    }
    const bgStyle = computed(()=>{
      const base64 = getBoardImgData(props.white, props.grey, props.size);
      return `background-image:url(${base64})`;
    });
    return {
      bgStyle,
    };
  },
});
</script>
<style scoped lang="less">
.board{
  background-size: contain;
}
</style>