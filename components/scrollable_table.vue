<template>
    <div class="relative w-full h-[var(--h)] mb-4" :style="{ '--h': pxHeight }">
        <div ref="tableEl" class="content">
            <div ref="prefixEl">
                <Tip v-if="enableTip">
                    <p>In caso di tabelle larghe, usa MAIUSC + ROTELLA MOUSE per scorrere orizzontalmente</p>
                </Tip>
            </div>
            <div ref="el">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const el = ref<HTMLElement | null>(null);
const size = useElementSize(el);
const prefixEl = ref<HTMLElement | null>(null);
const prefixSize = useElementSize(prefixEl);
const props = withDefaults(defineProps<{ enableTip?: boolean }>(), { enableTip: true });
const pxHeight = computed(() => size.height.value + prefixSize.height.value + "px");
</script>

<style lang="css" scoped>
.content {
    @apply absolute left-0 right-0 top-[0rem] overflow-auto;
}
</style>
