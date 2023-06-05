<template>
    <div>
        <div v-for="(item, index) in panels">
            <div :href="item.href">{{ item.label }}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'index',
    setup(props, ctx) {
        // @ts-ignore
        const panels = ref<Array<any>>(window['pluginPanels'] || []);
        return { panels }
    },
})
</script>

<style scoped></style>