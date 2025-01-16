<template>
    <div class="relative">
        <button :id="`${props.id}_button`" class="bg-surface w-full h-full hover:bg-accent rounded-xl px-4 py-2">
            {{ props.label }}
        </button>
        <div
            ref="el"
            :id="props.id"
            :style="{ '--max-h': maxHeight, '--x-offset': offsets.xOffset, '--y-offset': offsets.yOffset }"
            class="vertical-panel"
            v-if="open"
        >
            <button
                @click="emit('change', i, index)"
                v-for="(i, index) in props.items"
                class="element-button"
                :class="elementStyle(index, i)"
            >
                {{ itemsFormatter?.(i) ?? i.toString() }}
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
const open = ref(false);
const el = ref<HTMLElement | null>(null);
const offsets = ref<{ xOffset: string; yOffset: string }>({ xOffset: "0px", yOffset: "0px" });
const windowSize = useWindowSize();
const props = withDefaults(
    defineProps<{
        id: string;
        items: any[];
        label: string;
        itemsFormatter?: (e: any) => string;
        selectedItems?: any[];
        maxHeight?: string;
        closeOnClick?: boolean;
    }>(),
    { label: "Dropdown", selectedItems: <any>[], closeOnClick: false, maxHeight: "25rem" }
);
const emit = defineEmits<{
    (e: "change", value: any, index: number): void;
}>();

const elementStyle = computed(() => (index: number, i: any) => {
    if (!props.selectedItems) return [];
    if (
        (typeof i === "string" && props.selectedItems.includes(i.toLocaleLowerCase())) ||
        props.selectedItems.includes(i)
    ) {
        return ["bg-accent/50"];
    }

    return [];
});

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
        console.log(props.id);
    }
    if (bbox.y < 0) {
        offsets.value.yOffset = -bbox.y + "px";
    } else if (bbox.y > windowSize.height.value - bbox.height) {
        offsets.value.yOffset = -(windowSize.height.value - bbox.height) + "px";
    }
});

onMounted(() => {
    window.addEventListener("click", function (e) {
        if (props.closeOnClick && open.value) {
            open.value = false;
        } else if (
            e.target != this.document.getElementById(props.id) &&
            !this.document.getElementById(props.id)?.contains(e.target as Node) &&
            open.value
        ) {
            open.value = false;
        } else if (e.target == this.document.getElementById(`${props.id}_button`)) {
            open.value = !open.value;
        }
    });
});
</script>

<style lang="css" scoped>
.vertical-panel {
    z-index: 10;
    transform: translateX(calc(-50% + var(--x-offset, 0px)));
    overflow-y: scroll;
    @apply absolute max-h-[var(--max-h)] left-[50%] py-2 pl-[10px] pr-[4px] bg-surface rounded-xl gap-2 flex flex-col items-center border-outline border-[1px] justify-start;
}
.element-button {
    @apply hover:bg-outline w-full text-nowrap text-start px-4 py-2 rounded-lg;
}

/* Scroll bar stylings */
::-webkit-scrollbar {
    width: 6px;
}

/* Track */
::-webkit-scrollbar-track {
    background: transparent;
}

/* Handle */
::-webkit-scrollbar-thumb {
    background: theme("colors.background");
    border-radius: 4px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
    background: theme("colors.outline");
}
</style>
