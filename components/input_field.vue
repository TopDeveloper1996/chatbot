<template>
    <div class="flex flex-col items-stretch gap-[2px]">
        <p class="text-[1rem]">{{ props.label }}</p>
        <slot></slot>
        <span v-if="props.error?.length" class="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">
                                {{ props.error }}
                            </span>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ label: string, error?:string }>();
</script>

<style></style>
