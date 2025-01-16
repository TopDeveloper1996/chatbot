<template>
    <div
        v-if="mounted"
        class="background"
        :style="{ '--z-index': zIndex }"
        :class="{
            'opacity-0': !props.controller.expanded.value,
            'opacity-1': props.controller.expanded.value,
            'pointer-events-none': !props.controller.expanded.value,
            'pointer-events-auto': props.controller.expanded.value,
        }"
    ></div>

    <div
        v-if="mounted"
        class="sheet"
        :class="{
            'opacity-0': !props.controller.expanded.value,
            'opacity-1': props.controller.expanded.value,
            'pointer-events-none': !props.controller.expanded.value,
            'pointer-events-auto': props.controller.expanded.value,
            'translate-y-[0%]': props.controller.expanded.value,
            'translate-y-[25%]': !props.controller.expanded.value,
        }"
        :style="{ '--height': props.height, '--z-index': zIndex }"
    >
        <div class="relative overflow-hidden h-full" :style="{ '--z-index': zIndex }">
            <div
                :class="{
                    'opacity-0': !props.controller.expanded.value,
                    'opacity-1': props.controller.expanded.value,
                    'pointer-events-none': !props.controller.expanded.value,
                    'pointer-events-auto': props.controller.expanded.value,
                }"
                class="headline"
                :style="{ '--height': props.height }"
            >
                <div class="flex-1 font-semibold">
                    <h2 class="mb-0">{{ props.controller.options?.value?.title }}</h2>
                </div>
                <div class="flex items-center p-4 md:p-5">
                    <button
                        @click="props.controller.toggle(false)"
                        class="bg-gray-800 text-white py-2 px-4 rounded-full flex items-center shadow-lg border"
                    >
                        <icon class="size-4" name="material-symbols:arrow-back-ios-new-rounded"></icon>
                        Chiudi
                    </button>
                    <button
                        @click="props.controller.options?.value?.save()"
                        v-if="props.controller.options?.value?.save"
                        class="bg-blue-700 text-white py-2 px-4 rounded-full flex items-center shadow-lg border"
                    >
                        <icon class="size-4" name="material-symbols:save-rounded"></icon>
                        Salva
                    </button>
                </div>
            </div>
            <div v-if="controller.expanded.value" class="content">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const mounted = useMounted();
const props = withDefaults(defineProps<{ controller: ModalSheetController; height?: string; zIndex?: number }>(), {
    zIndex: 1000,
    height: "100%",
});
watch(props.controller.expanded, (expanded) => {
    if (expanded) {
        document.body.style.overflowY = "hidden";
    } else {
        document.body.style.overflowY = "scroll";
    }
});
</script>

<style lang="css" scoped>
body {
    @apply overflow-clip bg-red-200 !important;
}

.headline {
    z-index: calc(var(--z-index) + 1) !important;
    @apply border-[0px] shadow-md border-outline h-[4rem] border-b-[0px] p-6 fixed
        top-0 left-0 w-full bg-surface rounded-t-xl justify-center flex flex-row items-center transition-all duration-200
        ease-out;
}
.sheet {
    z-index: var(--z-index) !important;
    @apply fixed translate-x-[-50%] left-[50%] bottom-0 w-[100vw] border-x-[0px] h-[var(--height)] border-outline bg-background transition-all duration-200 ease-out;
}
.background {
    z-index: calc(var(--z-index) - 1) !important;
    @apply fixed translate-x-[-50%] left-[50%] bottom-0 w-[100vw] h-[100%] rounded-xl bg-background/50 transition-all duration-200 ease-out;
}

.content {
    @apply absolute left-0 right-0 overflow-y-auto px-4 py-[6rem]  flex flex-col justify-stretch w-full h-full;
}
</style>
