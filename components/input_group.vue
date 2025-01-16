<template>
    <div class="border-[2px] border-outline/50 p-4 rounded-xl flex flex-row items-stretch gap-4">
        <fieldset :disabled="!edit" class="flex flex-1 flex-row items-center gap-4">
            <div class="flex flex-row flex-1 gap-2 items-start" :class="[!edit ? 'text-text/75' : 'text-white']">
                <slot></slot>
            </div>
        </fieldset>

        <div v-if="props.editable" class="flex flex-col flex-grow-0 justify-center gap-2">
            <button v-if="!editing" @click="editing = true" class="button" :class="[edit ? 'text-accent' : []]">
                <icon class="size-8" name="material-symbols:edit-rounded"></icon>
            </button>
            <div v-else class="flex flex-row items-center gap-2 flex-wrap">
                <button @click="submit" class="button">
                    <icon class="size-8 text-green-500" name="material-symbols:check-circle-rounded"></icon>
                </button>
                <button @click="abort" class="button">
                    <icon class="size-8 text-red-500" name="material-symbols:cancel-rounded"></icon>
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const editing = ref(false);

const edit = computed(() => editing.value && props.editable);

const emit = defineEmits<{ (e: "submit"): void; (e: "abort"): void }>();
const props = withDefaults(defineProps<{ editable?: boolean }>(), { editable: false });
function submit() {
    editing.value = false;
    emit("submit");
}
function abort() {
    editing.value = false;
    emit("abort");
}
</script>

<style lang="css" scoped>
.button {
    @apply hover:bg-outline p-2 rounded-xl border-[2px] border-outline bg-surface transition-all duration-150 cursor-pointer;
}
</style>
