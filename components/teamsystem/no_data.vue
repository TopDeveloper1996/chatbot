<template>
    <div v-if="mounted">

        <div class="flex flex-col items-center justify-center min-h-screen space-y-4">
            <p class="text-lg font-bold	">Connetti TeamSystem per iniziare</p>
            <p class="text-lg font-medium">Va sulle impostazioni per connettere a TeamSystem</p>
            <button
                @click="props.onStartRobotModal()"
                class="bg-blue-500 text-white text-sm font-semibold py-2 px-4 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Connetti
            </button>
        </div>


    </div>
</template>

<script lang="ts" setup>
const mounted = useMounted();

const props = defineProps<{
    onStartRobotModal:  ()  => any;
}>();

</script>