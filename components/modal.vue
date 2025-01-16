<template>
    <div v-if="visible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        @click.self="close">
        <div class="bg-white rounded-lg shadow-lg w-full h-screen flex flex-col">
            <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-lg font-semibold text-black">{{ title }}</h2>
                <div class="flex items-center gap-2">
                    <div>
                    </div>
                    <button @click="download" class="text-gray-600 hover:text-gray-800 focus:outline-none">
                        Scarica File
                    </button>
                    <icon
                    name="material-symbols-light:download" class="size-8 text-accent"></icon>
                    
                <div>
                </div>    
                <button @click="close" class="text-gray-600 hover:text-gray-800 focus:outline-none">
                    Indietro
                </button>
                <icon
                name="material-symbols-light:arrow-forward" class="size-8 text-accent"></icon>
                
                </div>
            </div>
            <div v-if="loading" class="flex justify-center items-center h-32">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
            <div v-else class="flex-1 overflow-y-auto p-6">
                <div class="flex justify-center items-center text-lg">
                    <slot></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    visible: Boolean,
    title: {
        type: String,
        default: 'Modal Title'
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close', 'download']);

const close = () => {
    emit('close');
};
const download = () => {
    emit('download');
}
</script>

<style scoped>
/* Additional styles if needed */
</style>