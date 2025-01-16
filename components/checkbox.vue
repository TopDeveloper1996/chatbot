<template>
    <div class="flex flex-col items-center gap-8 w-full">
        <input type="checkbox" value="" class="sr-only" v-model="checked" />
        <div @click="checked = !checked" class="wrapper" :class="[checked ? 'bg-accent' : 'bg-surface']">
            <div
                class="dot"
                :class="{
                    'translate-x-[calc(var(--width)-var(--height))]': checked,
                }"
            ></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const checked = defineModel<boolean>();
const props = defineProps<{ width?: string; height?: string }>();
const emit = defineEmits<{ (e: "change", value: boolean | undefined): void }>();

watch(checked, () => emit("change", checked.value));
</script>

<style lang="css" scoped>
* {
    --width: 50px;
    --height: 26px;
    --dot-padding: 2px;
}
.wrapper {
    @apply relative h-[var(--height)] w-[var(--width)] rounded-full cursor-pointer;
}
.dot {
    height: calc(var(--height) - calc(var(--dot-padding)) * 2);
    width: calc(var(--height) - calc(var(--dot-padding)) * 2);
    @apply absolute start-[var(--dot-padding)] top-[var(--dot-padding)] rounded-full bg-white transition-all duration-150 ease-out;
}
.switch {
    position: relative;
    display: inline-block;
    width: var(--w, 80px);
    height: var(--h, 34px);
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    -webkit-transition: 0.4s;
    transition: 0.4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: calc(var(--h, 34px) - 6px);
    width: calc(var(--h, 34px) - 6px);
    left: 2px;
    bottom: 2px;
    background-color: white;
    -webkit-transition: 0.3s;
    transition: 0.3s;
}

input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(24px);
}

/* Rounded sliders */
.slider.round {
    border-radius: 34px;
}

.slider.round:before {
    border-radius: 50%;
}
</style>
