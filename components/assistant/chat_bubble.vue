<template>
    <div class="justify-start flex flex-col gap-2 max-w-[90%] cursor-pointer">
        <div class="flex flex-row items-center gap-2 ">
            <!-- <div
                class="flex flex-col items-center gap-1"
                :class="item.agent === ChatRole.user ? 'order-first' : 'order-last'"
            > -->
            <div
                class="flex flex-col items-center gap-1 order-last"
            >
                <p class="bg-surface rounded-2xl p-4 shadow-lg hover:shadow-cyan-500/50 transition-shadow duration-300">
                    <p v-html="htmlMessage"></p>
                    <span v-if="item.agent === ChatRole.user || !item.loading"></span>
                    <icon v-else class="size-6" name="svg-spinners:3-dots-bounce"></icon>
                </p>
                <!-- <p
                    class="text-sm text-text/60 w-full"
                    :class="item.agent === ChatRole.user ? 'text-end' : 'text-start'"
                > -->
                <p
                    class="text-sm text-text/60 w-full text-start"
                >
                    {{ moment(item.time).format("HH:mm") }}
                </p>
            </div>

            <icon class="size-8 shrink-0" v-if="item.icon" :name="item.icon"></icon>
        </div>
    </div>
</template>

<script lang="ts" setup>
import markdownit from 'markdown-it';
import moment from "moment";
const md = markdownit()

const props = defineProps<{ item: ChatMessage }>();
const htmlMessage = computed(() =>  md.render(props.item.content??""));
</script>

<style>
h3{
    margin-top: 20px;
}
p:has(strong){
    margin-top: 15px;
}
</style>
