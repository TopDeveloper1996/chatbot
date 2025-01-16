<template>
    <div :key="key" class="w-full h-full">
        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
const windowSize = useWindowSize();
const key = ref<number>(0);

watch(windowSize.width, () => {
    key.value = (key.value + 1) % 2;
});
</script>

<style></style>
