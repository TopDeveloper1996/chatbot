<template>
    <Transition name="fade" appear mode="out-in">
        <div
            v-if="display"
            class="absolute z-[100] top-0 left-0 w-screen h-screen overflow-hidden bg-background/50 flex flex-col items-center justify-center"
        >
            <icon name="svg-spinners:90-ring-with-bg" class="size-16"></icon>
        </div>
    </Transition>
</template>

<script lang="ts" setup>
const props = defineProps<{ display: boolean }>();
</script>

<style></style>
