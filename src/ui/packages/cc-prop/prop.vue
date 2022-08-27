<template>
  <div class="cc-prop"
       @mouseenter="isHove=true"
       @mouseleave="isHove=false"
  >
    <div v-show="isShowTips&&tooltip" ref="tips" class="tips">
      <div class="text">{{ tooltip }}</div>
      <div ref="arrow" data-popper-arrow class="arrow"></div>
    </div>
    <div class="name"
         @mouseenter="onHover"
         @mouseleave="onOver"
    >
      <span :class="isHove?'name-blue':''" ref="text">{{ name }}</span>
    </div>
    <div class="value">
      <slot style="flex:1;"></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { createPopper } from '@popperjs/core'
import { debounce, DebouncedFunc } from 'lodash'

export default defineComponent({
  name: 'cc-prop',
  props: {
    name: {
      type: String,
    },
    tooltip: {
      type: String,
      default: '',
    }
  },
  setup(props, { emit }) {
    onMounted(() => {


    })
    const name = ref(props.name || '')
    const isHove = ref(false);
    const tips = ref<HTMLElement>()
    const arrow = ref<HTMLElement>();
    const isShowTips = ref(false)
    let popperInstance: any = null;

    function showTipsFunc(target) {
      if (props.tooltip) {
        isShowTips.value = true;
        popperInstance = createPopper(target, tips.value, {
              placement: "top-start", modifiers: [
                {
                  name: 'arrow',
                  options: {
                    element: arrow.value,
                    padding: 6,// popper带有圆角时，不希望箭头移动到圆角
                  }
                },
                {
                  name: 'offset',
                  options: {
                    offset: [5, 5]
                  }
                }
              ]
            }
        )
      }
    }

    let timer = null;
    const text = ref<HTMLElement>();
    return {
      tips, isShowTips, arrow, text,
      name,
      isHove,
      onHover(event) {
        if (props.tooltip) {

          clearTimeout(timer);
          timer = setTimeout(() => {
            showTipsFunc(text.value)
          }, 600);
        }
      },
      onOver() {
        if (props.tooltip) {
          clearTimeout(timer)
          isShowTips.value = false;
          popperInstance?.destroy();
          popperInstance = null;
        }
      },
    }
  }
})
</script>

<style scoped lang="less">
.cc-prop {
  display: flex;
  width: 100%;
  height: 26px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 2px 0;
  overflow: hidden;

  .name {
    height: 100%;
    user-select: none;
    margin-left: 15px;
    flex-direction: row;
    justify-content: left;
    display: flex;
    align-items: center;
    width: 35%;
    min-width: 35%;

    span {
      color: #bdbdbd;
      display: block;
      font-size: 12px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  .tips {
    .text {
      background-color: #666666;
      border-radius: 6px;
      user-select: none;
      padding: 3px 9px;
      max-width: 200px;
      word-break: break-all;
    }

    .arrow {
      z-index: -1;

      &:before {
        display: block;
        content: '';
        transform: rotate(45deg);
        background-color: #666666;
        width: 10px;
        height: 10px;
      }
    }
  }

  .tips[data-popper-placement^='top'] {
    .arrow {
      bottom: -5px;
    }
  }

  .tips[data-popper-placement^='bottom'] {
    .arrow {
      top: -5px;
    }
  }

  .tips[data-popper-placement^='left'] {
    .arrow {
      right: -5px;
    }
  }

  .tips[data-popper-placement^='right'] {
    .arrow {
      left: -5px;
    }
  }


  .name-blue {
    color: #09f !important;
  }

  .value {
    overflow: hidden;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }
}
</style>
