<template>
    <li ref="el" class="transition-all duration-150">
        <button :title="props.title" class="relative button group" @click="onRootClick">
            <Icon class="size-6" :class="{ 'text-accent': selected }" :name="props.icon" />
            <Transition>
                <p class="pl-4" :class="{ 'text-white': selected }" v-if="!props.navbarCollapsed">
                    {{ props.title }}
                </p>
            </Transition>
            <Icon
                v-if="props.elements.length > 0"
                class="absolute right-0 transition-all duration-150"
                name="material-symbols:arrow-right-rounded"
                :class="{ 'rotate-90': sectionExpanded }"
            />
        </button>
        <div v-if="sectionExpanded && elements.length > 0" class="relative">
            <ul v-if="!navbarCollapsed" class="pl-8">
                <li v-for="item in props.elements">
                    <button class="link-button" :title="item.title" @click="(ev) => onSubelementClick(ev, item.path)">
                        <Icon name="ph:dot-outline-fill" class="size-6" />
                        <p>{{ item.title }}</p>
                    </button>
                </li>
            </ul>
            <div v-else class="floating-menu">
                <ul class="floating-menu-wrapper">
                    <li v-for="item in props.elements">
                        <button
                            class="link-button"
                            :title="item.title"
                            @click="(ev) => onSubelementClick(ev, item.path)"
                        >
                            <p>{{ item.title }}</p>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </li>
</template>

<script lang="ts" setup>
import { NavbarSectionItem } from "~/src/types/navbar_section_item";

const sectionExpanded = ref(false);
const route = useRoute();
const el = ref<HTMLElement | null>(null);

const selected = computed(() => {
    if (route.name === "index") return props.path === "/";
    return (
        route.path === props.path ||
        props.elements.map((e) => e.path).find((r) => r.includes(route.path?.toString() ?? ""))
    );
});

const clickPath = computed(() => (props.elements?.length > 0 ? "/" : props.path ?? "/"));

const emit = defineEmits(["click"]);

const props = defineProps({
    title: { type: String, required: true },
    icon: { type: String, required: true },
    path: { type: String },
    navbarCollapsed: { type: Boolean, required: true },
    elements: { type: Array<NavbarSectionItem>, default: [] },
});

function onRootClick(event: MouseEvent) {
    if (props.elements.length > 0) {
        sectionExpanded.value = !sectionExpanded.value;
    } else {
        navigateTo(clickPath.value);
        emit("click");
    }
}

function onSubelementClick(event: MouseEvent, path: string) {
    sectionExpanded.value = !sectionExpanded.value;
    navigateTo(path);
    emit("click");
}

function documentClick(event: MouseEvent) {
    if (event.target !== null && !el.value?.contains(event.target as Node)) {
        sectionExpanded.value = false;
    }
}

onMounted(() => {
    document.addEventListener("click", documentClick);
});

onUnmounted(() => {
    document.removeEventListener("click", documentClick);
});
</script>

<style lang="css" scoped>
.floating-menu-wrapper {
    @apply bg-surface rounded-xl px-2 py-1 border-outline border-[1px];
}
.floating-menu {
    @apply absolute bg-background right-[-6rem] top-[-3.5rem] rounded-xl mx-0;
}
.link-button {
    @apply gap-2 rounded-xl w-full flex flex-row items-center hover:text-white px-4 py-3 cursor-pointer select-none;
}
.button {
    @apply rounded-xl w-full flex items-center hover:text-white hover:bg-white/15 px-4 py-4 cursor-pointer select-none;
}

.v-enter-active {
    transition: opacity 150ms ease;
}
.v-leave-active {
    transition: none;
}
.v-leave-from {
    opacity: 0;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>
