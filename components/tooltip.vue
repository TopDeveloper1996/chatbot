<template>
    <div>
        <div class="relative" @mouseenter="open = true" @mouseleave="open = false">
            <icon
                class="size-5 text-outline hover:scale-110 transition-all duration-150 hover:text-accent ease-out cursor-pointer"
                name="material-symbols:chat-info-rounded"
            ></icon>
            <div v-if="open" ref="el" class="panel">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const el = ref<HTMLElement | null>(null);
const open = ref(false);
const offsets = ref<{ xOffset: string; yOffset: string }>({ xOffset: "0px", yOffset: "0px" });
const windowSize = useWindowSize();

watch(el, () => {
    if (!el.value) {
        offsets.value = { xOffset: "0px", yOffset: "0px" };
        return;
    }
    let bbox = el.value.getBoundingClientRect();
    if (bbox.x <= 0) {
        offsets.value.xOffset = -bbox.x + "px";
    } else if (bbox.x > windowSize.width.value - bbox.width) {
        offsets.value.xOffset = -(windowSize.width.value - bbox.width) + "px";
    }
    if (bbox.y < 0) {
        offsets.value.yOffset = -bbox.y + "px";
    } else if (bbox.y > windowSize.height.value - bbox.height) {
        offsets.value.yOffset = -(windowSize.height.value - bbox.height) + "px";
    }
});
</script>

<style lang="css" scoped>
.panel {
    transform: translateX(calc(-50% + var(--x-offset, 0px)));
    @apply absolute break-words text-wrap text-sm my-4 text-neutral-50/75 z-[100] min-w-[32rem] bg-surface_variant border-[1.5px] border-outline rounded-xl py-2 px-4;
}
</style>
