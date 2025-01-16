<template>
    <div class="flex flex-col items-center gap-8 w-full select-none">
        <div class="flex flex-row gap-4 items-center">
            <p
                @click="() => (checked = false)"
                class="cursor-pointer"
                :class="[!checked ? ['text-accent', 'font-bold'] : []]"
                title="Ogni riga della tabella è associata ad un documento"
            >
                Aggrega per documento
            </p>
            <label class="switch">
                <input v-model="checked" type="checkbox" />
                <span :class="{ 'bg-[#1FAD7E]': checked, 'bg-accent': !checked }" class="slider round"></span>
            </label>
            <p
                @click="() => (checked = true)"
                class="cursor-pointer"
                title="Ogni riga della tabella è associata ad un singolo tributo"
                :class="[checked ? ['text-[#1FAD7E]', 'font-bold'] : []]"
            >
                Aggrega per tributo
            </p>
        </div>
    </div>
</template>

<script lang="ts" setup>
const checked = defineModel<boolean>();
</script>

<style lang="css" scoped>
.switch {
    position: relative;
    display: inline-block;
    width: 80px;
    height: 34px;
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
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: 0.3s;
    transition: 0.3s;
}

input:checked + .slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(46px);
}

/* Rounded sliders */
.slider.round {
    border-radius: 34px;
}

.slider.round:before {
    border-radius: 50%;
}
</style>
