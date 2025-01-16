<template>
    <div class="border rounded-xl">
        <button @click="toggle"
            class="flex justify-between items-center w-full bg-white text-black p-2 focus:outline-none rounded-xl transition duration-300 ease-in-out hover:bg-sky-600 hover:text-white hover:shadow-lg">
            <span class="truncate-text">{{ title }}</span>
            <icon
                :name="isOpen ? 'material-symbols-light:top-panel-close-outline' : 'material-symbols-light:top-panel-open-outline'"
                class="size-8 text-accent"></icon>
        </button>
        <div ref="content" :id="props.id" :class="{ 'open': isOpen }" class="collapsible-content">
            <div class="p-4">
                <slot></slot>
            </div>
            <a v-if="link" @click="triggerParentMethod"
                style="display: block; cursor: pointer; text-decoration: underline" class="px-4 text-[0.9em]">
                vedi il contenuto...
            </a>
            <a v-if="link" :href="link" target="_blank"
                style="display: block; cursor: pointer; text-decoration: underline" class="px-4 py-4 text-[0.8em]">
                Ispeziona sorgente documentale...
            </a>
        </div>
    </div>
</template>

<script lang="ts" setup>

const emit = defineEmits(['ShowContent']);
const isOpen = ref(false);
const props = withDefaults(
    defineProps<{
        id: string;
        title: string;
        link: string | undefined;
    }>(),
    {}
);
const toggle = () => {
    isOpen.value = !isOpen.value;
};

const triggerParentMethod = () => {
    emit('ShowContent', [props.title, props.link]);
}
</script>
<style scoped>
.truncate-text {
    max-width: 90%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.collapsible-content {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
}

.collapsible-content.open {
    max-height: 500px;
    /* Adjust this value based on your content */
    opacity: 1;
}
</style>
